import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { View, ScrollView, StyleSheet, Platform, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector, useDispatch } from 'react-redux';

import HeaderButton from '../../components/UI/HeaderButton';
import Input from '../../components/UI/Input';
import * as productsAction from '../../store/actions/products';

import COLORS from '../../constants/Colors';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      inputValues: updatedValues,
      inputValidities: updatedValidities,
      formIsValid: updatedFormIsValid
    };
  }
  return state;
};

const EditProductScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const productId = props.navigation.getParam('productId');
  const editedProduct = useSelector(state => state.products.userProducts.find(product => product.id === productId));

  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : '',
      imageUrl: editedProduct ? editedProduct.imageUrl : '',
      description: editedProduct ? editedProduct.description : '',
      price: ''
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false
    },
    formIsValid: editedProduct ? true : false
  });

  useEffect(() => {
    if (error) {
      Alert.alert('An error occurred!', error, [{ text: 'Dismiss' }]);
    }
  }, [error]);

  const submitHandler = useCallback(async () => {
    if (!formState.formIsValid) {
      Alert.alert('Wrong input!', 'Please check the errors in the form.', [{ text: 'Ok' }], { cancelable: true });
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      if (editedProduct) {
        // Edit existing product
        await dispatch(
          productsAction.updateProduct(
            productId,
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl
          )
        );
      } else {
        // Add new product
        await dispatch(
          productsAction.createProduct(
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl,
            +formState.inputValues.price
          )
        );
      }
      props.navigation.goBack();
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  }, [dispatch, productId, formState]);

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier
      });
    },
    [dispatchFormState]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 500 })}>
      <ScrollView>
        <View style={styles.form}>
          <Input
            id="title"
            label="Title"
            invalidText="Please provide a valid title."
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next" // change the validation button label
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ''}
            initiallyValid={!!editedProduct}
            required
          />

          <Input
            id="imageUrl"
            label="Image URL"
            invalidText="Please provide a valid URL."
            keyboardType="default"
            returnKeyType="next" // change the validation button label
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.imageUrl : ''}
            initiallyValid={!!editedProduct}
            required
          />

          {editedProduct ? null : (
            <Input
              id="price"
              label="Price"
              invalidText="Please provide a valid price."
              keyboardType="decimal-pad"
              returnKeyType="next" // change the validation button label
              onInputChange={inputChangeHandler}
              required
              min={0.1}
            />
          )}

          <Input
            id="description"
            label="Description"
            invalidText="Please provide a valid description."
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            multiline
            numberOfLines={3}
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.description : ''}
            initiallyValid={!!editedProduct}
            required
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

EditProductScreen.navigationOptions = navData => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: navData.navigation.getParam('productId') ? 'Edit Product' : 'Add Product',
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item title="Save" iconName={Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'} onPress={submitFn} />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  form: { margin: 20 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default EditProductScreen;
