import { ApolloServer } from "apollo-server-express";
import express from "express";
import "dotenv/config";
import cors from "cors";
import { typeDefs } from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers/index.js";
import connectDB from "./db/connect.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "../client/build")));

const corsOptions = {
  origin: "https://drip-vault-fawn.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => console.log("Server is running"));
  } catch (error) {
    console.error("Server failed to start", error);
  }
};

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

startServer();
