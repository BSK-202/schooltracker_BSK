import { StyleSheet } from "react-native";

export default StyleSheet.create({
  background: {
    flex: 1,
    width: 400,
  height: 800,
  justifyContent: "center",
  alignItems: "center",
  },

  overlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },

  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20
  }
});
