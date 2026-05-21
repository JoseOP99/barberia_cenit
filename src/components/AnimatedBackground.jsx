import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null, radius: 180 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // Cantidad de estrellas basada en el tamaño de la pantalla
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 8000);
      
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 1.5 + 0.5;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        // Velocidad muy lenta para dar sensación de espacio profundo
        const speedX = (Math.random() - 0.5) * 0.3;
        const speedY = (Math.random() - 0.5) * 0.3;
        
        // Mezclamos estrellas blancas y doradas
        const colorOption = Math.random();
        let color = 'rgba(255, 255, 255, 0.4)';
        if (colorOption > 0.85) color = 'rgba(201, 168, 106, 0.8)'; // Dorado Cénit
        if (colorOption > 0.95) color = 'rgba(139, 111, 63, 0.8)';  // Cobre oscuro
        
        particles.push({ x, y, size, speedX, speedY, color, baseSize: size });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fondo espacial profundo con un gradiente oscuro
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 0, 0,
        canvas.width / 2, 0, canvas.width
      );
      gradient.addColorStop(0, '#151310'); // Un toque muy sutil cálido arriba
      gradient.addColorStop(0.5, '#0A0A0A');
      gradient.addColorStop(1, '#050403');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Resplandor del mouse
      if (mouse.x !== null && mouse.y !== null) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
        glow.addColorStop(0, 'rgba(201, 168, 106, 0.1)'); // Luz dorada en el centro
        glow.addColorStop(1, 'rgba(201, 168, 106, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dibujar y actualizar estrellas
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Reaparecer al salir de la pantalla
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Interacción con el mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            // Aumentar ligeramente de tamaño al acercarse el mouse
            p.size = p.baseSize + (mouse.radius - distance) * 0.015;
            
            // Dibujar líneas de constelación hacia el mouse
            ctx.beginPath();
            ctx.strokeStyle = `rgba(201, 168, 106, ${0.15 - distance / mouse.radius * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          } else {
            p.size = p.baseSize;
          }
        } else {
          p.size = p.baseSize;
        }

        // Parpadeo sutil (twinkle)
        const twinkleOpacity = Math.random() > 0.98 ? 0.3 : 1;

        // Dibujar estrella
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = twinkleOpacity;
        ctx.fill();
        ctx.globalAlpha = 1; // reset
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    // Inicializar
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0A0A0A]">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
