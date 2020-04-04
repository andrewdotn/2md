import React from "react";

export interface EmailFormProps {
  defaultEmail?: string;
  defaultName?: string;
  list: string;
  domain: string;
}

export function EmailForm(props: EmailFormProps) {
  const defaultEmailValue = props.defaultEmail
    ? { defaultValue: props.defaultEmail }
    : {};
  const defaultNameValue = props.defaultEmail
    ? { defaultValue: props.defaultName }
    : {};

  return (
    <form method="post" action="https://scripts.dreamhost.com/add_list.cgi">
      <input type="hidden" name="emailit" value="1" />
      <input type="hidden" name="list" value={props.list} />
      <input type="hidden" name="domain" value={props.domain} />

      <div className="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor="emailInput">
          Email
        </label>
        <input
          required
          type="email"
          name="email"
          className="form-control col-sm-10"
          id="emailInput"
          placeholder="foo@example.org"
          {...defaultEmailValue}
        />
      </div>

      <div className="form-group row">
        <label className="col-sm-2 col-form-label" htmlFor="nameInput">
          Name
        </label>
        <input
          className="form-control col-sm-10"
          id="nameInput"
          name="name"
          placeholder="(Optional)"
          {...defaultNameValue}
        />
      </div>

      <div className="row">
        <div className="form-control-label col d-sm-none">
          <input
            className="btn btn-primary btn-sm"
            type="submit"
            value="Subscribe"
          />

          <input
            className="btn btn-outline-danger btn-sm float-right"
            type="submit"
            name="submit"
            value="Unsubscribe"
          />
        </div>
        <div className="form-control-plaintext col d-none d-sm-block">
          <div className="float-right">
            <input
              className="btn btn-outline-danger btn-sm mr-2"
              type="submit"
              name="submit"
              value="Unsubscribe"
            />

            <input
              className="btn btn-primary btn-sm"
              type="submit"
              value="Subscribe"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
