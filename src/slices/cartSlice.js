import { createSlice } from "@reduxjs/toolkit";
import {toast} from "react-hot-toast";

const initialState = {
    totalItems: localStorage.getItem("totalItems") ?  JSON.parse(localStorage.getItem("totalItems")):0,
    cart: localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [],
    total: localStorage.getItem("total") ? JSON.parse(localStorage.getItem("total")) : 0,

};

const cartSlice = createSlice({
    name: "cart",
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            const course = action.payload;
            const index = state.cart.findIndex((item) => item._id === course._id);

            if(index >= 0){
                toast.error("Course already in cart");  // if the course is already added in the cart
                return
            }

            // if the course if not in the cart then it will add to the cart
            state.cart.push(course);
            state.totalItems++;
            state.total += course.price;

            // update the information to local storage
            localStorage.setItem("cart", JSON.stringify(state.cart));
            localStorage.setItem('total', JSON.stringify(state.total));
            localStorage.setItem('totalitems', JSON.stringify(state.totalItems));

            toast.success("Course is added to cart");
        },

        removeFromCart: (state, action) => {

            const courseId = action.payload;
            const index = state.cart.findIndex((item) => item._id === courseId);

            if(index >= 0){
                // if the course if found then we have to remove it from the cart
                state.totalItems--;
                state.total -= state.cart[index].price;
                state.cart.splice(index, 1);
                
                // let's update the local storage
                localStorage.setItem('cart', JSON.stringify(state.cart));
                localStorage.setItem('total', JSON.stringify(state.total));
                localStorage.setItem('totalItems', JSON.stringify(state.totalItems));

                toast.success("course removed from cart");
            }
        },

        resetCart: (state) => {
            state.cart = [];
            state.total = 0;
            state.totalItems = 0;

            // update to local storage
            localStorage.removeItem("cart");
            localStorage.removeItem("total");
            localStorage.removeItem("totalItems");
        }

    },
});

export const {addToCart, removeFromCart, resetCart} = cartSlice.actions;
export default cartSlice.reducer;
