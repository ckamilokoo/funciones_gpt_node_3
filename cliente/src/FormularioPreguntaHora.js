import React, { useState } from 'react';
import axios from 'axios';

function FormularioPreguntaHora() {
  const [ubicacion, setUbicacion] = useState('');
  const [respuesta, setRespuesta] = useState('');

  const handleChange = (e) => {
    setUbicacion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/preguntar`, {
        pregunta: ubicacion
      });

      setRespuesta(response.data.respuesta);
    } catch (error) {
      console.error('Error al enviar la pregunta:', error);
      setRespuesta('Hubo un error al enviar la pregunta.');
    }
  };

  return (
    <div>
      <h2>Formulario de Pregunta </h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="ubicacion">Pregunta : </label>
        <input
          type="text"
          id="ubicacion"
          value={ubicacion}
          onChange={handleChange}
          required
        />
        <button type="submit">Enviar Pregunta</button>
      </form>
      {respuesta && <p>Respuesta: {respuesta}</p>}
    </div>
  );
}

export default FormularioPreguntaHora;