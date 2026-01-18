// Dados dos barbeiros (usuário e senha)
// Em produção, isso viria de um banco de dados seguro
export const barbersDatabase = [
  {
    id: "Gui",
    username: "guilherme",
    password: "barbershop2026",
    name: "Guilherme",
  },
  {
    id: "Charles",
    username: "charles",
    password: "barbershop2026",
    name: "Charles",
  },
  {
    id: "Paulo",
    username: "paulo",
    password: "barbershop2026",
    name: "Paulo",
  },
];

export type BarberCredentials = {
  id: string;
  username: string;
  name: string;
};
