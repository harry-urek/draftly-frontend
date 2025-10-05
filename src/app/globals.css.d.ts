// Type declaration for CSS module - allows CSS imports in TypeScript
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
