import { supabase } from './supabaseClient';
import notificationService from './notificationService';
import { getEmailTemplate } from '../utils/emailTemplate';

const handleError = (error, context) => {
  const errorMessage = error?.message || 'Error desconocido';
  console.error(`[AuthService - ${context}]:`, errorMessage);
  throw new Error(errorMessage);
};

const validateEmail = (email) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  const invalidDomains = [
    'gmai.com', 'gmil.com', 'gmail.con', 'gmail.co', 'gemail.com',
    'hotmai.com', 'hotmil.com', 'hotmail.con', 'hotmail.co',
    'yaho.com', 'yahoo.con', 'oulook.com', 'outlok.com'
  ];
  
  if (invalidDomains.includes(domain)) {
    throw new Error(`El dominio @${domain} parece estar mal escrito. Verifica que sea correcto (ej. @gmail.com, @hotmail.com).`);
  }
  
  return true;
};

export const authService = {
  /**
   * Registro extendido con todos los campos del perfil.
   * El trigger on_auth_user_created crea el profile automáticamente.
   */
  async signUp({ email, password, first_name, second_name, first_lastname, second_lastname, phone, identification, identification_type }) {
    try {
      if (!email || !password) throw new Error('Email y contraseña son requeridos');
      if (!validateEmail(email)) throw new Error('Email inválido');
      if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
      if (!first_name || !first_lastname) throw new Error('Nombre y apellido son requeridos');

      // Prevenir duplicados de teléfono e identificación
      if (phone) {
        const { data } = await supabase.from('profiles').select('id').eq('phone', phone).limit(1);
        if (data && data.length > 0) throw new Error('Este número de teléfono ya está registrado por otro usuario');
      }
      
      if (identification) {
        const { data } = await supabase.from('profiles').select('id').eq('identification', identification).limit(1);
        if (data && data.length > 0) throw new Error('Esta identificación ya se encuentra registrada');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            second_name: second_name || null,
            first_lastname,
            second_lastname: second_lastname || null,
            phone: phone || null,
            identification: identification || null,
            identification_type: identification_type || 'CC',
          }
        }
      });

      if (error) handleError(error, 'signUp');

      // Enviar correos de bienvenida en segundo plano
      if (data?.user) {
        notificationService.sendEmail({
          to: email,
          subject: '¡Bienvenido a Cénit Barbería! 💈',
          html: getEmailTemplate(
            '¡Bienvenido a Cénit!',
            `<p>Hola <b>${first_name}</b>,</p>
             <p>Tu cuenta ha sido creada exitosamente. Bienvenido a la comunidad Cénit, donde el estilo y la elegancia se encuentran.</p>
             <div style="background-color: #1A1816; border: 1px solid #2A2530; padding: 15px; border-radius: 8px; margin: 20px 0;">
               <p style="margin: 0; color: #E8C77E;">Ahora puedes agendar tus citas, comprar en nuestra boutique exclusiva y participar en nuestros sorteos especiales.</p>
             </div>`,
            'https://cenit-barber.vercel.app/auth',
            'Ingresar a mi cuenta'
          )
        });

        // Correo a Nando
        notificationService.sendEmail({
          to: 'barbercenit@gmail.com', // O el correo del admin que definas
          subject: 'Nuevo cliente registrado: ' + first_name + ' ' + first_lastname,
          html: getEmailTemplate(
            'Nuevo Registro',
            `<p>Un nuevo cliente se acaba de registrar en la plataforma:</p>
             <ul style="list-style: none; padding: 0; margin: 15px 0;">
               <li style="margin-bottom: 8px;"><b>Nombre:</b> ${first_name} ${first_lastname}</li>
               <li style="margin-bottom: 8px;"><b>Email:</b> ${email}</li>
               <li style="margin-bottom: 8px;"><b>Teléfono:</b> ${phone || 'No registrado'}</li>
             </ul>`,
            'https://cenit-barber.vercel.app/admin/clients',
            'Ver Clientes'
          )
        });
      }

      return data;
    } catch (err) {
      handleError(err, 'signUp');
    }
  },

  async signIn(identifier, password) {
    try {
      if (!identifier || !password) throw new Error('Email/Teléfono y contraseña son requeridos');
      
      let emailToLogin = identifier.trim();

      // Si no contiene '@', asumimos que es un número de teléfono
      if (!emailToLogin.includes('@')) {
        const searchClean = identifier.replace(/\D/g, ''); 
        if (searchClean.length < 7) {
          throw new Error('Por favor ingresa un correo o número de teléfono válido.');
        }
        
        // Obtenemos perfiles para buscar coincidencia
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('email, phone')
          .not('phone', 'is', null);

        if (profileError || !profiles) {
          throw new Error('No se pudo verificar el número de teléfono.');
        }

        // Filtramos buscando que el teléfono termine con los dígitos ingresados (ignorando código de país si no lo puso)
        const matchedProfile = profiles.find(p => {
          if (!p.phone) return false;
          const pPhoneClean = p.phone.replace(/\D/g, '');
          return pPhoneClean.endsWith(searchClean);
        });

        if (!matchedProfile) {
          throw new Error('No se encontró una cuenta con ese número de teléfono.');
        }
        
        emailToLogin = matchedProfile.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: emailToLogin, password });
      if (error) handleError(error, 'signIn');

      // Verificar si el usuario está bloqueado
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', data.user.id)
          .single();

        if (profile?.status === 'blocked') {
          await supabase.auth.signOut();
          throw new Error('Tu cuenta ha sido suspendida por incumplimiento. Contacta al administrador.');
        }
        if (profile?.status === 'suspended') {
          await supabase.auth.signOut();
          throw new Error('Tu cuenta está temporalmente suspendida. Contacta al administrador.');
        }
      }

      return data;
    } catch (err) {
      handleError(err, 'signIn');
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) handleError(error, 'signOut');
    } catch (err) {
      handleError(err, 'signOut');
    }
  },

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user || null;
    } catch {
      return null;
    }
  },

  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session || null;
    } catch {
      return null;
    }
  },

  // Recuperar contraseña
  async resetPassword(email) {
    try {
      if (!email) throw new Error('Email es requerido');
      if (!validateEmail(email)) throw new Error('Email inválido');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) handleError(error, 'resetPassword');
      return true;
    } catch (err) {
      handleError(err, 'resetPassword');
    }
  },

  // Actualizar contraseña (después de reset)
  async updatePassword(newPassword) {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) handleError(error, 'updatePassword');
      return true;
    } catch (err) {
      handleError(err, 'updatePassword');
    }
  },

  // Reenviar correo de verificación
  async resendVerificationEmail(email) {
    try {
      if (!email) throw new Error('Email es requerido');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) handleError(error, 'resendVerification');
      return true;
    } catch (err) {
      handleError(err, 'resendVerification');
    }
  },

  // Obtener perfil
  async getProfile(userId) {
    try {
      if (!userId) throw new Error('User ID es requerido');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) handleError(error, 'getProfile');
      return data;
    } catch (err) {
      handleError(err, 'getProfile');
    }
  },

  // Actualizar perfil
  async updateProfile(userId, updates) {
    try {
      if (!userId) throw new Error('User ID es requerido');
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) handleError(error, 'updateProfile');
      return data;
    } catch (err) {
      handleError(err, 'updateProfile');
    }
  },

  // Verificar si es admin
  async isAdmin(userId) {
    try {
      if (!userId) return false;
      const profile = await this.getProfile(userId);
      return profile?.role === 'admin';
    } catch {
      return false;
    }
  },

  // Suscripción a cambios de auth
  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return data?.subscription;
  }
};

export default authService;
