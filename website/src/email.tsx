import "regenerator-runtime";

import { render } from "react-dom";
import React from "react";
import { EmailForm, EmailFormProps } from "./email-form";

document.addEventListener("DOMContentLoaded", async function() {
  const appDiv = document.getElementById("app");

  const params = new URLSearchParams(window.location.search);
  const page = params.get("page");
  const options: EmailFormProps = {
    list: "announce",
    domain: "2md.ca"
  };
  if (params.has("address")) {
    options.defaultEmail = params.get("address")!;
  }
  if (params.has("name")) {
    options.defaultName = params.get("name")!;
  }

  let message;
  switch (page) {
    case "subscribe":
      message = (
        <div className="alert alert-info">
          <h4>Your email subscription request has been received.</h4>

          <p>
            Look for an email from <b>donotreply@dreamhost.com</b> with subject
            “<b>Confirm 2md-announce subscription request</b>”. It may go to
            your spam folder.
          </p>

          <p>
            You won’t be on the list until you click on the link in that email.
          </p>

          <p className="mb-0">
            <i>If you were already on the list, no action has been taken.</i>
          </p>
        </div>
      );
      break;
    case "welcome":
      message = (
        <div className="alert alert-success">
          <h4>Welcome to the mailing list!</h4>
        </div>
      );
      break;
    case "unsubscribe":
      message = (
        <div className="alert alert-warning">
          <h4>Your unsubscribe request has been received.</h4>

          <p className="mb-0">
            If this was an error, you can always resubscribe.
          </p>
        </div>
      );
      break;
    case "invalid-email":
      message = (
        <div className="alert alert-danger">
          <h4>The email you provided is invalid. Please try again.</h4>
        </div>
      );
      break;
    default:
      message = (
        <h5>You can subscribe or unsubscribe to the mailing list here.</h5>
      );
  }

  render(
    <div>
      <div className="container-fluid px-0">
        <div className="jumbotron d-flex justify-content-center">
          <h1>
            <a href="/">2md</a> email
          </h1>
        </div>
      </div>

      <div className="container">
        {message}

        <EmailForm {...options} />

        <p>
          Problems?{" "}
          <a href="mailto:announce-admin@2md.ca">
            Contact the list administrator
          </a>
          .
        </p>
      </div>
    </div>,
    appDiv
  );
});
