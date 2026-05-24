
import Tesseract from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let mobilenetModel = null;

const MAPPED_COLORS = {
  'Negro': '#1A1816',
  'Blanco': '#F5F1E8',
  'Dorado': '#C9A86A',
  'Verde': '#7FA86A',
  'Rojo': '#C56B5A',
  'Azul': '#3B82F6',
  'Gris': '#9CA3AF'
};

function getClosestColorName(r, g, b) {
  let closestName = 'Negro';
  let minDistance = Infinity;

  for (const [name, hex] of Object.entries(MAPPED_COLORS)) {
    const hexR = parseInt(hex.slice(1, 3), 16);
    const hexG = parseInt(hex.slice(3, 5), 16);
    const hexB = parseInt(hex.slice(5, 7), 16);

    const dist = Math.sqrt(
      Math.pow(r - hexR, 2) + Math.pow(g - hexG, 2) + Math.pow(b - hexB, 2)
    );

    if (dist < minDistance) {
      minDistance = dist;
      closestName = name;
    }
  }

  return closestName;
}

export const extractColor = async (imageElement) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 50; 
    canvas.height = 50;
    ctx.drawImage(imageElement, 0, 0, 50, 50);
    
    const imageData = ctx.getImageData(0, 0, 50, 50).data;
    let r = 0, g = 0, b = 0, count = 0;
    
    for (let i = 0; i < imageData.length; i += 4) {
      const pr = imageData[i], pg = imageData[i+1], pb = imageData[i+2], a = imageData[i+3];
      if (a < 128) continue; // Ignorar transparentes
      if (pr > 240 && pg > 240 && pb > 240) continue; // Ignorar blanco (suele ser fondo)
      if (pr < 20 && pg < 20 && pb < 20) continue; // Ignorar negro puro (sombras)
      
      r += pr; g += pg; b += pb;
      count++;
    }
    
    if (count > 0) {
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
    } else {
      r = 0; g = 0; b = 0; // Fallback
    }

    const name = getClosestColorName(r, g, b);
    return { name, hex: MAPPED_COLORS[name] };
  } catch (error) {
    console.error("Color extraction failed:", error);
    return null;
  }
};

const TEAMS = ['Yankees', 'Dodgers', 'Bulls', 'Lakers', 'Red Sox', 'White Sox'];
const TEAM_ALIASES = {
  'NY': 'Yankees',
  'LA': 'Dodgers'
};

export const detectText = async (imageFileUrl) => {
  try {
    const result = await Tesseract.recognize(imageFileUrl, 'eng');
    const text = result.data.text.toUpperCase();
    
    for (const [alias, teamName] of Object.entries(TEAM_ALIASES)) {
      // Regex with word boundaries for short aliases to avoid matching mid-word
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(text)) return teamName;
    }
    for (const team of TEAMS) {
      if (text.includes(team.toUpperCase())) return team;
    }
    
    return '';
  } catch (error) {
    console.error("OCR failed:", error);
    return '';
  }
};

export const classifyProduct = async (imageElement) => {
  try {
    if (!mobilenetModel) {
      await tf.ready();
      mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
    }
    
    const predictions = await mobilenetModel.classify(imageElement);
    const textStr = predictions.map(p => p.className.toLowerCase()).join(' ');
    
    if (textStr.includes('hat') || textStr.includes('cap') || textStr.includes('sombrero') || textStr.includes('helmet')) {
      return 'Gorra';
    } else if (textStr.includes('shirt') || textStr.includes('jersey') || textStr.includes('clothing') || textStr.includes('sweatshirt')) {
      return 'Camiseta';
    }
    
    return 'Básicos';
  } catch (error) {
    console.error("Classification failed:", error);
    return null;
  }
};

export const analyzeImage = async (file) => {
  return new Promise((resolve, reject) => {
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = imgUrl;
    img.crossOrigin = "Anonymous";
    
    img.onload = async () => {
      try {
        const [colorData, teamName, collectionName] = await Promise.all([
          extractColor(img),
          detectText(imgUrl),
          classifyProduct(img)
        ]);
        
        URL.revokeObjectURL(imgUrl);
        resolve({
          color: colorData,
          team: teamName,
          collection: collectionName
        });
      } catch (err) {
        URL.revokeObjectURL(imgUrl);
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(imgUrl);
      reject(new Error("Failed to load image"));
    };
  });
};
