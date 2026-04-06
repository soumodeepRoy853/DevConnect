import "./globals.css";
import Providers from "./providers";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "DevConnect",
  description: "Developer community platform",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
