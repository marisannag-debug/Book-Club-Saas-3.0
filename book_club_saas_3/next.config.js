/**
 * Next.js config to ensure Turbopack uses the correct project root
 * This sets the turbopack root explicitly so Next doesn't infer a workspace
 * root from other lockfiles on the machine.
 */
/** @type {import('next').NextConfig} */
module.exports = {
  // `turbopack.root` is read by Next to determine the project root for Turbopack
  turbopack: {
    root: __dirname,
  },
};
