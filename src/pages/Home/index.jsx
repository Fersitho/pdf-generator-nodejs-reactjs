import React, { useRef, useState } from "react";
import "./css.css";

const Home = () => {
  const [urlInput, setUrlInput] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);

  const isValidURL = (url) => {
    // Expresión regular para verificar si es una URL válida
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlPattern.test(url);
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setUrlInput(newValue);
    setIsValidUrl(isValidURL(newValue));
  };

  const handleClick = async () => {
    if (isValidUrl) {
      let data = { url: urlInput };

      try {
        let response1 = await fetch(
          "https://masterclass.diazfernando.es/api/test",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!response1.ok) {
          throw Error(response1.statusText);
        }
        let json1 = await response1.json();
        let cls1 = await json1;
        console.log('sigueee')
        let response2 = await fetch(
          "https://masterclass.diazfernando.es/api/generate-pdf",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!response2.ok) {
          throw Error(response2.statusText);
        }
        let json2 = await response2.json();
        let cls2 = await json2;

        // Haz algo con la respuesta del servidor, según sea necesario
      } catch (error) {
        console.error("Error al procesar la solicitud:", error);
        // Maneja el error, muestra un mensaje al usuario, etc.
      }
    } else {
      alert("Por favor, ingrese una URL válida.");
    }
  };

  return (
    <section className="main">
      <h1 className="text-pop-up-top">🤟😜</h1>
      <h1 className="text-pop-up-top"> Webpage Capture Tool </h1>
      <div className="InputContainer">
        <input
          placeholder=" 👉 Enter URL here to download!"
          id="input"
          className="input"
          name="text"
          type="text"
          value={urlInput}
          onChange={handleChange}
        />
      </div>
      {isValidUrl && (
        <a className="codepen-button heartbeat" onClick={handleClick}>
          <span>Convert to PDF 👌</span>
        </a>
      )}
    </section>
  );
};

export default Home;
