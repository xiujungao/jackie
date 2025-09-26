import { createContext } from "react";
import useProduct from "./useProduct.jsx";

export const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { cart, cartCount, cartSum, handleAddProduct, handleRemoveProduct } = useProduct();

    return (
        <CartContext
            value={{
                cart,
                cartCount,
                cartSum,
                handleAddProduct,
                handleRemoveProduct,
            }}
        >
            {children}
        </CartContext>
    );
}