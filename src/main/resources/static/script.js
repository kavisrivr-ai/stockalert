const API = "http://localhost:8080/api";

let editingProductId = null;


// =====================================================
// COMMON FUNCTIONS
// =====================================================

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


async function getJSON(url, options = {}) {

    const response = await fetch(url, options);

    let data = null;

    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }

    if (!response.ok) {

        const message =
            data?.message ||
            data?.error ||
            "Request failed";

        throw new Error(message);
    }

    return data;
}


// =====================================================
// DASHBOARD
// =====================================================

async function loadDashboard() {

    try {

        console.log("Loading dashboard...");

        // ---------------------------------------------
        // Load products
        // ---------------------------------------------

        const products =
            await getJSON(`${API}/products`);

        console.log("Products:", products);


        // Total products
        const totalProductsElement =
            document.getElementById("totalProducts");

        if (totalProductsElement) {

            totalProductsElement.textContent =
                products.length;
        }


        // ---------------------------------------------
        // Calculate stock
        // ---------------------------------------------

        let totalStock = 0;
        let lowStockProducts = [];

        for (const product of products) {

            try {

                const stock =
                    await getJSON(
                        `${API}/stock-movements/product/${product.id}/current-stock`
                    );

                const currentStock =
                    Number(stock) || 0;

                totalStock += currentStock;


                if (
                    currentStock <=
                    Number(product.reorderThreshold)
                ) {

                    lowStockProducts.push({

                        ...product,

                        currentStock:
                            currentStock
                    });
                }

            } catch (error) {

                console.error(
                    "Stock loading error for product:",
                    product.id,
                    error
                );
            }
        }


        // Total stock
        const totalStockElement =
            document.getElementById("totalStock");

        if (totalStockElement) {

            totalStockElement.textContent =
                totalStock;
        }


        // Low stock count
        const lowStockCountElement =
            document.getElementById("lowStockCount");

        if (lowStockCountElement) {

            lowStockCountElement.textContent =
                lowStockProducts.length;
        }


        // ---------------------------------------------
        // Load open reorder alerts
        // ---------------------------------------------

        try {

            const alerts =
                await getJSON(
                    `${API}/reorder-alerts/open`
                );

            const alertCountElement =
                document.getElementById("alertCount");

            if (alertCountElement) {

                alertCountElement.textContent =
                    alerts.length;
            }

        } catch (error) {

            console.error(
                "Alert loading error:",
                error
            );
        }


        // ---------------------------------------------
        // Display low stock products
        // ---------------------------------------------

        displayLowStock(lowStockProducts);


        console.log(
            "Dashboard loaded successfully."
        );

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        const totalProductsElement =
            document.getElementById("totalProducts");

        const totalStockElement =
            document.getElementById("totalStock");

        const lowStockCountElement =
            document.getElementById("lowStockCount");

        const alertCountElement =
            document.getElementById("alertCount");


        if (totalProductsElement) {
            totalProductsElement.textContent = "0";
        }

        if (totalStockElement) {
            totalStockElement.textContent = "0";
        }

        if (lowStockCountElement) {
            lowStockCountElement.textContent = "0";
        }

        if (alertCountElement) {
            alertCountElement.textContent = "0";
        }


        displayLowStock([]);
    }
}


function displayLowStock(products) {

    const table =
        document.getElementById("lowStockTable");

    if (!table) {
        return;
    }


    if (!products || products.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    No low-stock products.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        products.map(product => {

            return `
                <tr>

                    <td>
                        ${escapeHtml(product.name)}
                    </td>

                    <td>
                        ${escapeHtml(product.sku)}
                    </td>

                    <td>
                        ${product.currentStock}
                    </td>

                    <td>
                        ${product.reorderThreshold}
                    </td>

                    <td>
                        <span class="status status-low">
                            Low Stock
                        </span>
                    </td>

                </tr>
            `;

        }).join("");
}


// =====================================================
// PRODUCTS
// =====================================================

async function loadProducts() {

    const table =
        document.getElementById("productsTable");

    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="6" class="empty">
                Loading products...
            </td>
        </tr>
    `;


    try {

        const products =
            await getJSON(`${API}/products`);


        if (!products || products.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6" class="empty">
                        No products found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            products.map(product => {

                return `
                    <tr>

                        <td>
                            ${product.id}
                        </td>

                        <td>
                            ${escapeHtml(product.name)}
                        </td>

                        <td>
                            ${escapeHtml(product.sku)}
                        </td>

                        <td>
                            ${product.reorderThreshold}
                        </td>

                        <td>
                            ${product.reorderQuantity}
                        </td>

                        <td>

                            <button
                                class="btn-edit"
                                onclick="editProduct(${product.id})">

                                Edit

                            </button>

                            <button
                                class="btn-delete"
                                onclick="deleteProduct(${product.id})">

                                Delete

                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Failed to load products.
                </td>
            </tr>
        `;
    }
}


async function saveProduct(event) {

    event.preventDefault();


    const name =
        document.getElementById("productName").value.trim();

    const sku =
        document.getElementById("productSku").value.trim();

    const reorderThreshold =
        Number(
            document.getElementById("reorderThreshold").value
        );

    const reorderQuantity =
        Number(
            document.getElementById("reorderQuantity").value
        );


    const productData = {

        name: name,

        sku: sku,

        reorderThreshold:
            reorderThreshold,

        reorderQuantity:
            reorderQuantity
    };


    try {

        if (editingProductId) {

            await getJSON(
                `${API}/products/${editingProductId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(productData)
                }
            );

            alert(
                "Product updated successfully!"
            );

        } else {

            await getJSON(
                `${API}/products`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(productData)
                }
            );

            alert(
                "Product added successfully!"
            );
        }


        cancelEdit();

        await loadProducts();

        if (typeof loadDashboard === "function") {
            await loadDashboard();
        }

    } catch (error) {

        console.error(
            "Save product error:",
            error
        );

        alert(
            "Failed to save product.\n\n" +
            error.message
        );
    }
}


async function editProduct(id) {

    try {

        const product =
            await getJSON(
                `${API}/products/${id}`
            );


        document.getElementById("productName").value =
            product.name;

        document.getElementById("productSku").value =
            product.sku;

        document.getElementById("reorderThreshold").value =
            product.reorderThreshold;

        document.getElementById("reorderQuantity").value =
            product.reorderQuantity;


        editingProductId = id;


        const formTitle =
            document.getElementById("formTitle");

        if (formTitle) {

            formTitle.textContent =
                "Edit Product";
        }


        const submitButton =
            document.getElementById("submitButton");

        if (submitButton) {

            submitButton.textContent =
                "Update Product";
        }


        const cancelButton =
            document.getElementById("cancelButton");

        if (cancelButton) {

            cancelButton.style.display =
                "inline-block";
        }


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Edit product error:",
            error
        );

        alert(
            "Failed to load product.\n\n" +
            error.message
        );
    }
}


async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await getJSON(
            `${API}/products/${id}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Product deleted successfully!"
        );


        await loadProducts();

        if (typeof loadDashboard === "function") {
            await loadDashboard();
        }

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Failed to delete product.\n\n" +
            error.message
        );
    }
}


function cancelEdit() {

    editingProductId = null;


    const form =
        document.getElementById("productForm");

    if (form) {
        form.reset();
    }


    const formTitle =
        document.getElementById("formTitle");

    if (formTitle) {

        formTitle.textContent =
            "Add Product";
    }


    const submitButton =
        document.getElementById("submitButton");

    if (submitButton) {

        submitButton.textContent =
            "Add Product";
    }


    const cancelButton =
        document.getElementById("cancelButton");

    if (cancelButton) {

        cancelButton.style.display =
            "none";
    }
}


// =====================================================
// STOCK MOVEMENT
// =====================================================

async function loadStockProducts() {

    const select =
        document.getElementById("stockProduct");

    if (!select) {
        return;
    }


    try {

        const products =
            await getJSON(`${API}/products`);


        select.innerHTML = `
            <option value="">
                Select Product
            </option>
        `;


        products.forEach(product => {

            const option =
                document.createElement("option");

            option.value =
                product.id;

            option.textContent =
                `${product.name} (${product.sku})`;

            select.appendChild(option);
        });


        if (products.length > 0) {

            select.value =
                products[0].id;

            await loadCurrentStock();
            await loadStockMovements();
        }

    } catch (error) {

        console.error(
            "Stock product loading error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Failed to load products
            </option>
        `;
    }
}


async function loadCurrentStock() {

    const select =
        document.getElementById("stockProduct");

    const stockElement =
        document.getElementById("currentStock");


    if (!select || !stockElement) {
        return;
    }


    const productId =
        select.value;


    if (!productId) {

        stockElement.textContent =
            "0";

        return;
    }


    try {

        const stock =
            await getJSON(
                `${API}/stock-movements/product/${productId}/current-stock`
            );


        stockElement.textContent =
            Number(stock) || 0;

    } catch (error) {

        console.error(
            "Current stock loading error:",
            error
        );

        stockElement.textContent =
            "0";
    }
}


async function saveStockMovement(event) {

    event.preventDefault();


    const productId =
        document.getElementById("stockProduct").value;

    const quantity =
        Number(
            document.getElementById("stockQuantity").value
        );

    const type =
        document.getElementById("movementType").value;

    const reason =
        document.getElementById("movementReason").value;


    if (!productId) {

        alert(
            "Please select a product."
        );

        return;
    }


    if (!quantity || quantity <= 0) {

        alert(
            "Please enter a valid quantity."
        );

        return;
    }


    try {

        await getJSON(
            `${API}/stock-movements/product/${productId}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    quantity:
                        quantity,

                    type:
                        type,

                    reason:
                        reason
                })
            }
        );


        alert(
            "Stock movement added successfully!"
        );


        const form =
            document.getElementById("stockForm");

        if (form) {
            form.reset();
        }


        // Keep the same product selected
        const productSelect =
            document.getElementById("stockProduct");

        if (productSelect) {

            productSelect.value =
                productId;
        }


        await loadCurrentStock();

        await loadStockMovements();


        if (typeof loadDashboard === "function") {
            await loadDashboard();
        }

    } catch (error) {

        console.error(
            "Stock movement error:",
            error
        );

        alert(
            "Failed to add stock movement.\n\n" +
            error.message
        );
    }
}


async function loadStockMovements() {

    const table =
        document.getElementById("stockMovementsTable");

    const select =
        document.getElementById("stockProduct");


    if (!table || !select) {
        return;
    }


    const productId =
        select.value;


    if (!productId) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Select a product to view movements.
                </td>
            </tr>
        `;

        return;
    }


    try {

        const movements =
            await getJSON(
                `${API}/stock-movements/product/${productId}`
            );


        if (!movements || movements.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        No stock movements found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            movements.map(movement => {

                const createdAt =
                    movement.createdAt
                        ? new Date(
                            movement.createdAt
                        ).toLocaleString()
                        : "-";


                return `
                    <tr>

                        <td>
                            ${movement.id}
                        </td>

                        <td>
                            ${movement.quantity}
                        </td>

                        <td>
                            ${movement.type}
                        </td>

                        <td>
                            ${movement.reason}
                        </td>

                        <td>
                            ${createdAt}
                        </td>

                    </tr>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Stock movement loading error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty">
                    Failed to load stock movements.
                </td>
            </tr>
        `;
    }
}


// =====================================================
// REORDER ALERTS
// =====================================================

async function loadAlerts() {

    const table =
        document.getElementById("alertsTable");

    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="7" class="empty">
                Loading alerts...
            </td>
        </tr>
    `;


    try {

        const alerts =
            await getJSON(
                `${API}/reorder-alerts`
            );


        if (!alerts || alerts.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        No reorder alerts found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            alerts.map(alert => {

                const statusClass =
                    alert.status === "OPEN"
                        ? "status status-open"
                        : "status status-fulfilled";


                const action =
                    alert.status === "OPEN"
                        ? `
                            <button
                                class="btn-success"
                                onclick="fulfillAlert(${alert.alertId})">

                                Fulfill

                            </button>
                          `
                        : `
                            <span class="status status-fulfilled">
                                Completed
                            </span>
                          `;


                const createdAt =
                    alert.createdAt
                        ? new Date(
                            alert.createdAt
                        ).toLocaleString()
                        : "-";


                return `
                    <tr>

                        <td>
                            ${alert.alertId}
                        </td>

                        <td>
                            <strong>
                                ${escapeHtml(
                                    alert.productName
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escapeHtml(
                                alert.sku
                            )}
                        </td>

                        <td>
                            ${alert.reorderQuantity}
                        </td>

                        <td>

                            <span class="${statusClass}">
                                ${alert.status}
                            </span>

                        </td>

                        <td>
                            ${createdAt}
                        </td>

                        <td>
                            ${action}
                        </td>

                    </tr>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Alert loading error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Failed to load reorder alerts.
                </td>
            </tr>
        `;
    }
}


async function loadOpenAlerts() {

    try {

        return await getJSON(
            `${API}/reorder-alerts/open`
        );

    } catch (error) {

        console.error(
            "Open alert loading error:",
            error
        );

        return [];
    }
}


async function fulfillAlert(alertId) {

    const confirmed =
        confirm(
            "Are you sure you want to fulfill this reorder?\n\n" +
            "The reorder quantity will be added to the current stock."
        );


    if (!confirmed) {
        return;
    }


    try {

        await getJSON(
            `${API}/reorder-alerts/${alertId}/fulfill`,
            {
                method: "PUT"
            }
        );


        alert(
            "Reorder fulfilled successfully!\n\n" +
            "The reorder quantity has been added to current stock."
        );


        await loadAlerts();


        if (typeof loadDashboard === "function") {
            await loadDashboard();
        }


        if (
            document.getElementById("stockProduct")
        ) {

            await loadStockProducts();
        }

    } catch (error) {

        console.error(
            "Fulfill alert error:",
            error
        );

        alert(
            "Failed to fulfill reorder alert.\n\n" +
            error.message
        );
    }
}


// =====================================================
// FAST MOVING PRODUCTS
// =====================================================

async function loadFastMoving() {

    const table =
        document.getElementById("fastMovingTable");

    const fromDateElement =
        document.getElementById("fromDate");

    const toDateElement =
        document.getElementById("toDate");


    if (
        !table ||
        !fromDateElement ||
        !toDateElement
    ) {
        return;
    }


    const fromDate =
        fromDateElement.value;

    const toDate =
        toDateElement.value;


    if (!fromDate || !toDate) {

        alert(
            "Please select both From Date and To Date."
        );

        return;
    }


    if (fromDate > toDate) {

        alert(
            "From Date cannot be greater than To Date."
        );

        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="4" class="empty">
                Analyzing sales...
            </td>
        </tr>
    `;


    try {

        const products =
            await getJSON(`${API}/products`);


        let results = [];


        for (const product of products) {

            try {

                const movements =
                    await getJSON(
                        `${API}/stock-movements/product/${product.id}`
                    );


                let totalSales = 0;


                movements.forEach(movement => {

                    if (
                        movement.reason === "SALE" &&
                        movement.createdAt
                    ) {

                        const movementDate =
                            movement.createdAt.substring(
                                0,
                                10
                            );


                        if (
                            movementDate >= fromDate &&
                            movementDate <= toDate
                        ) {

                            totalSales +=
                                Number(
                                    movement.quantity
                                ) || 0;
                        }
                    }
                });


                if (totalSales > 0) {

                    results.push({

                        productId:
                            product.id,

                        productName:
                            product.name,

                        sku:
                            product.sku,

                        totalSales:
                            totalSales
                    });
                }

            } catch (error) {

                console.error(
                    "Fast moving error for product:",
                    product.id,
                    error
                );
            }
        }


        results.sort(
            (a, b) =>
                b.totalSales -
                a.totalSales
        );


        if (results.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="4" class="empty">
                        No sales found for the selected date range.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            results.map((item, index) => {

                return `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.productName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.sku
                            )}
                        </td>

                        <td>
                            ${item.totalSales}
                        </td>

                    </tr>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Fast moving loading error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    Failed to analyze sales.
                </td>
            </tr>
        `;
    }
}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "StockAlert page loaded."
        );


        // Dashboard
        if (
            document.getElementById("totalProducts") ||
            document.getElementById("lowStockTable")
        ) {

            loadDashboard();
        }


        // Products page
        if (
            document.getElementById("productsTable")
        ) {

            loadProducts();
        }


        // Product form
        const productForm =
            document.getElementById("productForm");

        if (productForm) {

            productForm.addEventListener(
                "submit",
                saveProduct
            );
        }


        // Cancel product edit
        const cancelButton =
            document.getElementById("cancelButton");

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                cancelEdit
            );
        }


        // Stock page
        if (
            document.getElementById("stockProduct")
        ) {

            loadStockProducts();


            const stockProduct =
                document.getElementById(
                    "stockProduct"
                );


            stockProduct.addEventListener(
                "change",
                async function () {

                    await loadCurrentStock();

                    await loadStockMovements();
                }
            );
        }


        // Stock form
        const stockForm =
            document.getElementById("stockForm");

        if (stockForm) {

            stockForm.addEventListener(
                "submit",
                saveStockMovement
            );
        }


        // Alerts page
        if (
            document.getElementById("alertsTable")
        ) {

            loadAlerts();
        }


        // Fast moving page
        const fastMovingButton =
            document.getElementById(
                "fastMovingButton"
            );


        if (fastMovingButton) {

            fastMovingButton.addEventListener(
                "click",
                loadFastMoving
            );
        }

    }
);