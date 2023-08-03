import express from 'express';
import http from 'http';
import path from 'path';
import exphbs from 'express-handlebars';
import { ProductManager } from './ProductManager.js'; // Importamos ProductManager usando 'import'
const socketIO = require('socket.io'); // Importamos socket.io con 'require'

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 8080;


// Instancia del ProductManager
const productManager = new ProductManager('products.json');

// Configurar el motor de plantillas Handlebars
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Middleware
app.use(express.json());

// Endpoint para obtener los productos
app.get('/api/products', (req, res) => {
    const { limit } = req.query;
    let products = productManager.getProducts();

    if (limit) {
        const limitNum = parseInt(limit);
        products = products.slice(0, limitNum);
    }

    res.json(products);
});

// Endpoint para obtener los producto por su ID
app.get('/api/products/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const product = productManager.getProductById(productId);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Ruta POST para agregar un nuevo producto
app.post('/api/products', (req, res) => {
    const newProduct = req.body;
    productManager.addProduct(newProduct);
    
    // Emitir evento de nuevo producto a través de sockets
    io.emit('productoCreado', newProduct);

    res.json(newProduct);
});

// Ruta PUT para actualizar un producto por su ID
app.put('/api/products/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const fieldsToUpdate = req.body;
    productManager.updateProduct(productId, fieldsToUpdate);
    
    // Emitir evento de actualización a través de sockets
    io.emit('productoActualizado', productId);

    res.json({ message: 'Product updated successfully' });
});

// Ruta DELETE para eliminar un producto por su ID
app.delete('/api/products/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    productManager.deleteProduct(productId);
    
    // Emitir evento de eliminación a través de sockets
    io.emit('productoEliminado', productId);

    res.json({ message: 'Product deleted successfully' });
});


// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la vista en tiempo real utilizando Handlebars y WebSockets
app.get('/realtimeproducts', (req, res) => {
    const products = productManager.getProducts();
    res.render('realTimeProducts', { products }); // Asegúrate de tener una vista "realTimeProducts.handlebars"
});

// Manejar conexiones de socket.io
io.on('connection', (socket) => {
    console.log('Usuario conectado por WebSocket');

    socket.on('productoCreado', (newProduct) => {
        // Manejar evento de nuevo producto
        console.log('Nuevo producto:', newProduct);
    });

    socket.on('productoActualizado', (productId) => {
        // Manejar evento de producto actualizado
        console.log('Producto actualizado:', productId);
    });

    socket.on('productoEliminado', (productId) => {
        // Manejar evento de producto eliminado
        console.log('Producto eliminado:', productId);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado por WebSocket');
    });
});


// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor Express corriendo en http://localhost:${port}`);
});
