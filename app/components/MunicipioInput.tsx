"use client";

import { useId, type InputHTMLAttributes } from "react";
import { NOMBRES_MUNICIPIOS_SALAMANCA } from "../../lib/municipios-salamanca";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "list" | "type">;

export function MunicipioInput({ autoComplete, ...props }: Props) {
  const listId = `municipios-salamanca-${useId().replace(/:/g, "")}`;

  return (
    <>
      <input
        {...props}
        type="text"
        list={listId}
        autoComplete={autoComplete ?? "address-level2"}
      />
      <datalist id={listId}>
        {NOMBRES_MUNICIPIOS_SALAMANCA.map((nombre) => (
          <option key={nombre} value={nombre} />
        ))}
      </datalist>
    </>
  );
}
