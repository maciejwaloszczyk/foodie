"use client";
import { getImagePath } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  const usePathName = usePathname();

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (typeof window !== "undefined") {
      setSticky(window.scrollY > 0);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    handleStickyNavbar();
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl || typeof window === "undefined") {
      return;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerEl.offsetHeight ?? 0);
    };

    updateHeaderHeight();

    const observer = new ResizeObserver(() => updateHeaderHeight());
    observer.observe(headerEl);

    return () => {
      observer.disconnect();
    };
  }, [sticky, navbarOpen]);

  useEffect(() => {
    handleStickyNavbar();
  }, [usePathName]);

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index: any) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <>
      <div aria-hidden="true" style={{ height: headerHeight }} />
      <header
        ref={headerRef}
        // WYSOKOŚĆ: 70px
        style={{
            height: sticky ? "70px" : "auto",
            transition: "all 0.3s ease-in-out"
        }}
       className={`header fixed left-0 top-0 z-40 flex w-full items-center ${
          sticky
            ? "z-[9999] bg-primary-light !bg-opacity-95 shadow-sticky backdrop-blur-sm dark:bg-bg-color-dark dark:shadow-sticky-dark !py-0" 
            : "bg-transparent py-4"
        }`}
      >
        <div className="container h-full">
          <div className="relative -mx-4 flex items-center justify-between h-full">
            
            {/* LOGO */}
            <div className="w-60 max-w-full px-4 xl:mr-12 flex items-center h-full">
              <Link
                href="/"
                className={`flex items-center gap-3 transition-all duration-300 ease-in-out hover:scale-105 ${
                  sticky ? "!py-0" : "py-2"
                }`}
              >
                {/* Logo ikonka */}
                <Image
                  src={getImagePath("/images/logo/logo.svg")}
                  alt="logo"
                  width={sticky ? 50 : 80}
                  height={sticky ? 50 : 80}
                  className={`${sticky ? "!w-[50px] !h-[50px]" : "!w-[80px] !h-[80px]"} object-contain`}
                />
                {/* Napis foodie */}
                <span className={`font-bold text-white ${sticky ? "text-2xl" : "text-4xl"}`}>
                  Foodie
                </span>
              </Link>
            </div>

            <div className="flex w-full items-center justify-between px-4 h-full">
              <div className="flex items-center h-full">
                <button
                  onClick={navbarToggleHandler}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="absolute right-4 top-1/2 block translate-y-[-50%] rounded-lg px-3 py-[6px] ring-primary focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-text-main transition-all duration-300 dark:bg-white ${
                      navbarOpen ? " top-[7px] rotate-45" : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-text-main transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "opacity-0 " : " "
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-text-main transition-all duration-300 dark:bg-white ${
                      navbarOpen ? " top-[-8px] -rotate-45" : " "
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-bg-color-dark lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:flex lg:space-x-12">
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path ? (
                          <Link
                            href={menuItem.path}
                            className={`flex text-base lg:mr-0 lg:inline-flex lg:px-0 ${
                              sticky ? "!py-0" : "py-6"
                            } ${
                              usePathName === menuItem.path
                                ? "text-primary dark:text-white"
                                : "text-text-main hover:text-primary dark:text-white/70 dark:hover:text-white"
                            }`}
                          >
                            {menuItem.title}
                          </Link>
                        ) : (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className={`flex cursor-pointer items-center justify-between py-2 text-base text-text-main group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 ${
                                sticky ? "!py-0" : "py-6"
                              }`}
                            >
                              {menuItem.title}
                              <span className="pl-3">
                                <svg
                                  width="25"
                                  height="24"
                                  viewBox="0 0 25 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu relative left-0 top-full rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 dark:bg-bg-color-dark lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                                openIndex === index ? "block" : "hidden"
                              }`}
                            >
                              {menuItem.submenu
                                ?.filter((submenuItem) => submenuItem.path)
                                .map((submenuItem, index) => (
                                  <Link
                                    href={submenuItem.path as string}
                                    key={index}
                                    className="block rounded py-2.5 text-sm text-text-main hover:text-primary dark:text-white/70 dark:hover:text-white"
                                  >
                                    {submenuItem.title}
                                  </Link>
                                ))}
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="flex items-center justify-end pr-16 lg:pr-0 h-full">
                {isAuthenticated ? (
                  <>
                    <span className="hidden px-4 py-3 text-base font-medium text-text-main dark:text-white md:block">
                      Witaj, {user?.username}
                    </span>
                    <button
                      onClick={logout}
                      className={`ease-in-up hidden rounded-full bg-primary px-8 text-base font-medium text-white shadow-btn transition duration-300 hover:bg-opacity-90 hover:shadow-btn-hover md:block md:px-9 lg:px-6 xl:px-9 ${
                        sticky ? "!py-2" : "py-3"
                      }`}
                    >
                      Wyloguj
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className={`hidden px-7 text-base font-medium text-text-main hover:opacity-70 dark:text-white md:block ${
                        sticky ? "!py-2" : "py-3"
                      }`}
                    >
                      Zaloguj się
                    </Link>
                    <Link
                      href="/signup"
                      className={`ease-in-up hidden rounded-full bg-primary px-8 text-base font-medium text-white shadow-btn transition duration-300 hover:bg-opacity-90 hover:shadow-btn-hover md:block md:px-9 lg:px-6 xl:px-9 ${
                        sticky ? "!py-2" : "py-3"
                      }`}
                    >
                      Zarejestruj się
                    </Link>
                  </>
                )}
                <div className={`flex items-center ${sticky ? "scale-90" : ""}`}>
                  <ThemeToggler />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;