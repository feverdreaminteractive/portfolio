const CART_FRAGMENT = `#graphql
fragment cartFragment on Cart {
  id
  totalQuantity
  checkoutUrl
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      merchandise {
        ...on ProductVariant {
          id
          title
          image {
            url
            altText
            width
            height
          }
          product {
            handle
            title
          }
        }
      }
      cost {
        amountPerQuantity {
          amount
          currencyCode
        }
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
    }
  }
}
`;

const PRODUCT_FRAGMENT = `#graphql
fragment productFragment on Product {
  id
  title
  handle
  featuredImage {
    url
    width
    height
    altText
  }
  variants(first: 1) {
    nodes {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
    }
  }
}
`;

export const ProductByHandleQuery = `#graphql
  query ($handle: String!) {
    product(handle: $handle) {
      ...productFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GetCartQuery = `#graphql
  query ($id: ID!) {
    cart(id: $id) {
      ...cartFragment
    }
  }
  ${CART_FRAGMENT}
`;

export const CreateCartMutation = `#graphql
  mutation ($merchandiseId: ID!, $quantity: Int!) {
    cartCreate(input: { lines: [{ merchandiseId: $merchandiseId, quantity: $quantity }] }) {
      cart {
        ...cartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const AddCartLinesMutation = `#graphql
  mutation ($cartId: ID!, $merchandiseId: ID!, $quantity: Int!) {
    cartLinesAdd(cartId: $cartId, lines: [{ merchandiseId: $merchandiseId, quantity: $quantity }]) {
      cart {
        ...cartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

export const RemoveCartLinesMutation = `#graphql
  mutation ($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;
