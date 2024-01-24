import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useLocalStorage } from "../../Hooks/LocalStorage";
import TextareaAutosize from "react-autosize-textarea";
import Toolbar from "./Toolbar";
import fileDownload from "js-file-download";
import "bootstrap/dist/css/bootstrap.min.css";
import socketIOClient from "socket.io-client";

const wsRootUrl = "ws://localhost:5000";
const InitialVal = `## Real-time Markdown Editor with Live Preview

**Features**

- _Markdown Editor Interface_
- _Live Preview_
- _Syntax Highlighting_
- _Backend Markdown Processing_
- _Download File_`;

function Editor() {
  const [socket, setSocket] = useState(null);

  const body = {
    background: "rgb(17 36 39 / 94%)",
    paddingTop: "30px",
    paddingBottom: "50px",
    fontFamily: "monospace",
    color: "wheat",
  };
  const mdIn = {
    width: "100%",
    height: "auto",
    minHeight: "80vh",
    padding: "15px 15px",
    borderRadius: "2px",
    background: "white",
    boxShadow: "rgb(0 0 0 / 49%) 2px 2px 10px",
    border: 0,
    outline: "none",
  };
  const mdOut = {
    width: "100%",
    height: "auto",
    minHeight: "80vh",
    padding: "15px 15px",
    borderRadius: "2px",
    background: "white",
    boxShadow: "rgb(0 0 0 / 49%) 2px 2px 10px",
    backgroundColor: "#f3f3f3",
    color: "black",
  };

  const [userInput, updateStorageInput] = useLocalStorage(
    "mdEditor",
    InitialVal
  );
  const [userOut, updateOut] = useState("");

  useEffect(() => {
    const socket = socketIOClient.connect(wsRootUrl, {
      secure: true,
      transports: ["websocket", "polling"],
    });
    setSocket(() => socket);
    // sending inital val to the server
    if (socket) {
      socket.emit("markdown", InitialVal);
    }
    //Unmounting Components
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("html", (html) => {
        // console.log(html);
        updateOut(html);
      });
    }
  }, [socket]);

  const handelChange = (e) => {
    // console.log(e.target.value);
    updateStorageInput(e.target.value);
    if (socket) {
      socket.emit("markdown", e.target.value);
    }
  };

  return (
    <div>
      <Container fluid style={body}>
        <Row
          style={{
            justifyContent: "center",
            paddingLeft: "45px",
            paddingRight: "45px",
            paddingTop: "25px",
          }}
        >
          <Col md={6} className="text-center">
            <h3 className="text-center">Markdown Editor</h3>
            <Toolbar
              clickHandler={() => {
                fileDownload(userInput, "README.md");
              }}
            />
            <TextareaAutosize
              id="textarea_input"
              onChange={handelChange}
              value={userInput}
              style={mdIn}
            />
          </Col>
          <Col md={6} style={{ paddingTop: "35px" }}>
            <h3 className="text-center"> Html Preview</h3>
            <div
              dangerouslySetInnerHTML={{ __html: userOut }}
              style={mdOut}
            ></div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Editor;
