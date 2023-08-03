import fs from 'fs';

class ProductManager {
    //Constructor que recibe la ruta del archivo de productos
    constructor(path) {
        this.path = path;
        this.products = [];
        this.loadProducts();
    }

    //Método para cargar los productos desde el archivo JSON
    loadProducts() {
        try {
            const data = fs.readFileSync(this.path, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            console.log('Error loading products:', error.message);
            this.products = [];
        }
    }

    //Método para guardar los productos en el archivo JSON
    saveProducts() {
        try {
            const data = JSON.stringify(this.products, null, 2);
            fs.writeFileSync(this.path, data, 'utf-8');
        } catch (error) {
            console.log('Error saving products:', error.message);
        }
    }

    //Método para obtener el último ID existente en el array de products
    getLastProductId() {
        if (this.products.length === 0) {
            return 0;
        }
        return this.products[this.products.length - 1].id;
    }

    //Método para agregar un nuevo producto al array de products
    addProduct(product) {
        const newProduct = {
            ...product,
            id: this.getLastProductId() + 1 //Generando un nuevo ID
        };

        this.products.push(newProduct);
        this.saveProducts();
    }

    //Método para actualizar un producto existente por su ID
    updateProduct(id, fieldsToUpdate) {
        const productIndex = this.products.findIndex((product) => product.id === id);
        if (productIndex !== -1) {
            const product = this.products[productIndex];
            const updatedProduct = {
                ...product,
                ...fieldsToUpdate
            };
            this.products[productIndex] = updatedProduct;
            this.saveProducts();
        } else {
            console.log('Product not found');
        }
    }

    //Método para eliminar un producto existente por su ID
    deleteProduct(id) {
        this.products = this.products.filter((product) => product.id !== id);
        this.saveProducts();
    }

    //Método para obtener los productos
    getProducts() {
        return this.products;
    }

    //Método para obtener un producto por ID
    getProductById(id) {
        const product = this.products.find((product) => product.id === id);
        return product;
    }
}

export { ProductManager };
