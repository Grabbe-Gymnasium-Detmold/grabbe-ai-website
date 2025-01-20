# GrabbeAI Frontend
---

This repository contains the frontend code for the GrabbeAI project, a web-based application designed to interact with the GrabbeAI backend via a RESTful API. The project is built with React, Vite, and styled using TailwindCSS. This application is intended for internal use within the Grabbe-Gymnasium Detmold.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Interactive UI**: Modern and responsive user interface.
- **API Integration**: Seamless communication with the GrabbeAI backend (other repository).
- **Fast Build System**: Utilizes Vite for a quick development experience.
- **Custom Styling**: TailwindCSS for flexible and utility-first design.


## Technologies Used
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [Vite](https://vitejs.dev/) - A modern frontend build tool.
- [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [TypeScript](https://www.typescriptlang.org/) - A strongly typed programming language that builds on JavaScript.
- [ESLint](https://eslint.org/) - A tool for identifying and fixing problems in JavaScript code.
- [Prettier](https://prettier.io/) - An opinionated code formatter.
- [React Router](https://reactrouter.com/) - A library for routing in React applications.
- [i18next](https://www.i18next.com/) - An internationalization framework for JavaScript.
- [Framer Motion](https://www.framer.com/motion/) - A library for creating animations in React.
- [PostCSS](https://postcss.org/) - A tool for transforming CSS with plugins.
- [Terser](https://terser.org/) - A JavaScript parser and mangler/compressor toolkit for ES6+.
- [GrabbeAI Backend](https://github.com/Grabbe-Gymnasium-Detmold/grabbe-ai-backend/) - Our backend for the OpenAI API.
## Setup and Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Grabbe-Gymnasium-Detmold/grabbe-ai-website.git
   ```
2. **Navigate to the Project Directory:**
   ```bash
   cd grabbe-ai-website
   ```
3. **Install Dependencies:**
   Ensure you have [Node.js](https://nodejs.org/) installed, then run:
   ```bash
   npm install
   ```
4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` by default.

## Development

### Available Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run preview`: Preview the production build locally.

### Project Structure

- `src/`: Contains the source code of the application and react entry point / routing.
    - `components/`: Reusable React components.
    - `sites/`: Main application pages.
    - `assets/`: Static assets such as images or icons.
    - `locales/`: Translations.
    - `lib/`: Library files

## Deployment

1. Build the project for production:
   ```bash
   npm run build
   ```
2. Deploy the generated `dist/` directory to your hosting provider.

## Contributing

This project is for internal use at the Grabbe-Gymnasium Detmold. Contributions are limited to authorized staff or students. To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a pull request.

## License

This code is the property of Grabbe-Gymnasium Detmold and is intended for internal use only. Unauthorized copying, sharing, or distribution is strictly prohibited.


---

For questions or issues, please contact the project maintainers via the internal communication channels at Grabbe-Gymnasium Detmold (IServ) or via mail (`grabbeai@finnbusse.de`,`kontakt@maximilianvonbeck.de`)
