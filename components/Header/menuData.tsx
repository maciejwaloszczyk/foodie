import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Strona Główna",
    path: "/",
    newTab: false,
  },
  {
    id: 11,
    title: "Mapa",
    path: "/map",
    newTab: false,
  },
  {
    id: 2,
    title: "O nas",
    path: "/about",
    newTab: false,
  },
  {
    id: 33,
    title: "Blog",
    path: "/blog",
    newTab: false,
  },
  {
    id: 3,
    title: "Kontakt",
    path: "/contact",
    newTab: false,
  },
  {
    id: 4,
    title: "Strony",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "O nas",
        path: "/about",
        newTab: false,
      },
      {
        id: 42,
        title: "Kontakt",
        path: "/contact",
        newTab: false,
      },
      {
        id: 43,
        title: "Blog (Lista)",
        path: "/blog",
        newTab: false,
      },
      {
        id: 44,
        title: "Blog (Pasek boczny)",
        path: "/blog-sidebar",
        newTab: false,
      },
      {
        id: 45,
        title: "Szczegóły wpisu",
        path: "/blog-details",
        newTab: false,
      },
      {
        id: 46,
        title: "Logowanie",
        path: "/signin",
        newTab: false,
      },
      {
        id: 47,
        title: "Rejestracja",
        path: "/signup",
        newTab: false,
      },
      {
        id: 48,
        title: "Strona błędu (404)",
        path: "/error",
        newTab: false,
      },
    ],
  },
];
export default menuData;