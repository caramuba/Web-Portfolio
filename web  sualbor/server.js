const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de base de datos JSON
const productsFilePath = path.join(__dirname, 'backend', 'data', 'products.json');

// Auxiliar para leer productos
const readProductsFile = () => {
  try {
    const data = fs.readFileSync(productsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo de productos:', error);
    return [];
  }
};

// --- ENDPOINTS DE API ---

// GET /api/products - Obtener todos los productos
app.get('/api/products', (req, res) => {
  const products = readProductsFile();
  res.json(products);
});

// GET /api/products/:id - Obtener un producto por su ID
app.get('/api/products/:id', (req, res) => {
  const products = readProductsFile();
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: `Producto con ID ${id} no encontrado` });
  }
});

// Ruta fallback para redireccionar al catálogo si se ingresa a cualquier otra ruta no estática
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de Sualbor corriendo en http://localhost:${PORT}`);
});
