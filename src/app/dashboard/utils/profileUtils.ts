export function getProfileImage(name: string) {
  if (name.toLowerCase() === "reuben") return "/gitau.png";
  if (name.toLowerCase() === "peter") return "/peter.png";
  if (name.toLowerCase() === "john") return "/john.png";
  if (name.toLowerCase() === "wilfred") return "/wilfred.jpeg";
  return "/default.png";
}
