<div align="center">
    <a href="https://github.com/FuelLabs/fuel-streams-js">
        <img src="https://fuellabs.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F9ff3607d-8974-46e8-8373-e2c96344d6ff%2F81a0a0d9-f3c7-4ccb-8af5-40ca8a4140f9%2FFUEL_Symbol_Circle_Green_RGB.png?table=block&id=cb8fc88a-4fc3-4f28-a974-9c318a65a2c6&spaceId=9ff3607d-8974-46e8-8373-e2c96344d6ff&width=2000&userId=&cache=v2" alt="Logo" width="80" height="80">
    </a>
    <h3 align="center">Fuel Streams Demo App</h3>
    <p align="center">
        A simple demo application showcasing the @fuels/streams library
    </p>
</div>

## 📝 About

The Fuel Streams Demo App is a React-based web application that demonstrates the capabilities of the `@fuels/streams` library. It provides a user interface for connecting to the Fuel Network, configuring stream subscriptions, and visualizing real-time blockchain data.

## 🚀 Features

- Connect to different Fuel Network environments (Local, Testnet, Mainnet)
- Configure stream subscriptions with various subjects and filters
- Visualize real-time blockchain data
- View and inspect incoming messages
- Dark/light theme support

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (version 1.2.2 or higher)
- [Node.js](https://nodejs.org/) (LTS version recommended)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/FuelLabs/fuel-streams-js.git
cd fuel-streams-js
```

2. Install dependencies:

```bash
bun install
```

3. Build the required packages:

```bash
bun run build:libs
```

### Running the App

Start the development server:

```bash
bun run dev:app
```

This will start the application on [http://localhost:5173](http://localhost:5173).

## 🧪 Testing

Run the tests:

```bash
bun run test
```

Run end-to-end tests:

```bash
bun run test:e2e
```

## 🏗️ Building for Production

Build the application for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## 🤝 Contributing

Contributions are welcome! Please see the [Contributing Guide](https://github.com/FuelLabs/fuel-streams-js/blob/main/CONTRIBUTING.md) for more information.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/FuelLabs/fuel-streams-js/blob/main/LICENSE) file for details.
