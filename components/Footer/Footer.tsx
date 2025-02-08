"use client";

import React from "react";
import { ThemeSwitcher } from "../ThemeProvider/theme-switcher";

function Footer() {
  return (
    <footer className="flex items-center justify-center bg-[#274c77] text-white py-6 mt-8">
      © V.T.O 2025
      <ThemeSwitcher />
    </footer>
  );
}

export default Footer;