// src/styles/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#E6FFFA",
      100: "#B2F5EA",
      200: "#81E6D9",
      300: "#4FD1C5",
      400: "#38B2AC",
      500: "#319795", // ✅ Matches the 'Get Started' button
      600: "#2C7A7B",
      700: "#285E61",
      800: "#234E52",
      900: "#1D4044",
    },
  },
  components: {
    Button: {
      variants: {
        solid: (props) => ({
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        }),
      },
    },
  },
});

export default theme;
