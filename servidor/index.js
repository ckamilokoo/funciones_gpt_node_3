import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import moment from 'moment-timezone'
import axios from "axios";

dotenv.config();

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

// Middleware para habilitar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite solicitudes desde cualquier origen
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());

// Ruta POST para enviar preguntas a ChatGPT
app.post("/preguntar", async (req, res) => {
  const { pregunta } = req.body;
  console.log(pregunta)
  // Función para buscar la hora en una ubicación dada
  async function lookupTime(location) {
    try {
      const res = await axios.get(
        `http://worldtimeapi.org/api/timezone/${location}`
      );
      const { datetime } = res.data;
      let time = moment.tz(datetime, location).format('h:mmA')
      return `El tiempo actual en ${location} es ${time}`;
    } catch (error) {
      console.error("Error al buscar la hora:", error);
      return "Lo siento, no pude obtener la hora en ese lugar.";
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: pregunta },
      ],
      functions: [
        {
          name: "lookupTime",
          description: "Look up the current time in a given location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description:
                  'La ubicacion de la cual se quiere saber la hora actual. Ejemplo: "Bogota". Pero debe estar escrigo con el nombre del timezone por ejemplo: Asia/Shangai, America/Bogota, Europe/Madrid, etc.',
              },
            },
            required: ["location"],
          },
        },
      ],
      function_call: "auto",
    });

    const completionResponse = completion.choices[0].message;

    if (!completionResponse.content) {
      const functionCallName = completionResponse.function_call.name;

      if (functionCallName === "lookupTime") {
        const args = JSON.parse(completionResponse.function_call.arguments);
        const respuesta = await lookupTime(args.location);
        res.json({ respuesta });
      }
    } else {
      res.json({ respuesta: completionResponse.content });
    }
  } catch (error) {
    console.error("Error al procesar la pregunta:", error);
    res.status(500).json({ error: "Hubo un error al procesar la pregunta." });
  }
});

// Puerto en el que escucha el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
