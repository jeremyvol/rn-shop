import PRODUCTS from '../../data/dummy-data';
import { DELETE_PRODUCT, CREATE_PRODUCT, UPDATE_PRODUCT, SET_PRODUCTS } from '../actions/products';
import Product from '../../models/product';

const initialState = {
  availableProducts: PRODUCTS,
  userProducts: PRODUCTS.filter(product => product.ownerId === 'u1')
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_PRODUCTS:
      return {
        availableProducts: action.products,
        userProducts: action.products.filter(product => product.ownerId === 'u1')
      };
    case CREATE_PRODUCT:
      const newProduct = new Product(
        action.productData.id,
        'u1',
        action.productData.title,
        action.productData.imageUrl,
        action.productData.description,
        action.productData.price
      );
      return {
        ...state,
        availableProducts: state.availableProducts.concat(newProduct),
        userProducts: state.userProducts.concat(newProduct)
      };
    case UPDATE_PRODUCT:
      const userProductIndex = state.userProducts.findIndex(product => product.id === action.pid);
      const availableProductIndex = state.availableProducts.findIndex(product => product.id === action.pid);

      const updatedProduct = new Product(
        action.pid,
        state.userProducts[userProductIndex].ownerId,
        action.productData.title,
        action.productData.imageUrl,
        action.productData.description,
        state.userProducts[userProductIndex].price
      );

      const updatedUserProducts = [...state.userProducts];
      const updatedAvailableProducts = [...state.availableProducts];

      updatedUserProducts[userProductIndex] = updatedProduct;
      updatedAvailableProducts[availableProductIndex] = updatedProduct;
      return {
        ...state,
        userProducts: updatedUserProducts,
        availableProducts: updatedAvailableProducts
      };
    case DELETE_PRODUCT:
      return {
        ...state,
        userProducts: state.userProducts.filter(product => product.id !== action.pid),
        availableProducts: state.availableProducts.filter(product => product.id !== action.pid)
      };
  }
  return state;
};
