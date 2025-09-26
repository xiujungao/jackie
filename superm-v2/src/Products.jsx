import { useState, useTransition } from "react";
import Product from "./Product";
import { useSuspenseQuery } from "@tanstack/react-query";
import { get } from "./fetcher";

export default function Products() {
    const { data: products } = useSuspenseQuery({
        queryKey: ["products-list"],
        queryFn: () => get("products-list"),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const [, startTransition] = useTransition();
    const [query, setQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState(products);

    function handleSearchChange(event) {
        const searchQuery = event.target.value.trim().toLowerCase();
        setQuery(searchQuery);
        startTransition(() => {
            setFilteredProducts(
                products.filter((product) =>
                    product.name.toLowerCase().includes(searchQuery)
                )
            );
        });
    }

    function handleReset() {
        setQuery("");
        setFilteredProducts(products);
    }

    return (
        <>
            <div className="products-title">
                <h1>Products</h1>
                <title>Products | SuperM</title>
                <input
                    type="search"
                    className="search"
                    value={query}
                    placeholder="Search products"
                    onChange={handleSearchChange}
                />
            </div>
            {filteredProducts.length === 0 ? (
                <div className="products-not-found">
                    <div>
                        <h2>No products found!</h2>
                        <p>
                            Your search &quot;<strong>{query}</strong>&quot; was
                            not found in our store.
                        </p>
                        <button
                            className="btn btn-dimmed"
                            type="button"
                            onClick={handleReset}
                        >
                            Reset search
                        </button>
                    </div>
                </div>
            ) : null}
            <div className="products-grid">
                {filteredProducts.map((product) => (
                    <Product key={product.id} details={product} />
                ))}
            </div>
        </>
    );
}
