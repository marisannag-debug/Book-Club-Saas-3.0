import { render, screen, within } from "@testing-library/react";
import Home from "../../app/page";

describe("Home", () => {
  it("renders the landing sections and primary navigation", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "Organizuj swój book club w jednym miejscu" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Zarejestruj się" }).some((link) => link.getAttribute("href") === "/register")).toBe(true);
    expect(screen.getByRole("link", { name: "Masz konto? Zaloguj się" })).toHaveAttribute("href", "/login");

    expect(screen.queryByRole("heading", { name: "Szybkie głosowania" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Zaproszenia i zarządzanie" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Kalendarz spotkań" })).not.toBeInTheDocument();

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(within(footer as HTMLElement).getByRole("link", { name: "Zaloguj" })).toHaveAttribute("href", "/login");
  });
});