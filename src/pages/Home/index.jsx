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
      let response = await fetch("http://localhost:4040/api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log(response);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      let json = await response.json();
      let cls = await json;
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
