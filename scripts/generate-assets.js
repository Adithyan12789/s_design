const fs = require('fs');

const pngWhite = fs.readFileSync('public/s-design-emblem-white.png').toString('base64');
const pngBlue = fs.readFileSync('public/s-design-emblem-transparent.png').toString('base64');

const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <style>
    .icon-light { display: block; }
    .icon-dark { display: none; }
    @media (prefers-color-scheme: dark) {
      .icon-light { display: none; }
      .icon-dark { display: block; }
    }
  </style>
  <image class="icon-light" href="data:image/png;base64,${pngBlue}" width="512" height="512" />
  <image class="icon-dark" href="data:image/png;base64,${pngWhite}" width="512" height="512" />
</svg>
`;

fs.writeFileSync('public/icon.svg', svgContent.trim());
console.log('Saved public/icon.svg successfully!');

