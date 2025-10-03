export const Logo = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "10px",
        width: "100%",
      }}
    >
      <svg
        width="140"
        height="40"
        viewBox="0 0 140 40"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          maxWidth: "140px",
          height: "auto",
        }}
      >
        {/* Square border with darker gradient */}
        <defs>
          <linearGradient
            id="borderGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" style={{ stopColor: "hsl(213.6, 100%, 4.9%)" }} />
            <stop offset="100%" style={{ stopColor: "hsl(220, 50%, 13.2%)" }} />
          </linearGradient>
          {/* Gradient for the "N" logo */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "hsl(214, 100%, 65%)" }} />
            <stop offset="100%" style={{ stopColor: "hsl(215, 100%, 60%)" }} />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="4"
          fill="none"
          stroke="url(#borderGradient)"
          strokeWidth="2"
        />
        {/* "N" icon inside the square with new gradient */}
        <text
          x="10"
          y="28"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="bold"
          fill="url(#logoGradient)"
          className="dark:fill-[url(#logoGradient)]"
          style={{ transition: "fill 0.3s" }}
        >
          N
        </text>
        {/* Shop name "Nova Small" */}
        <text
          x="45"
          y="25"
          fontFamily="Arial, sans-serif"
          fontSize="16"
          fontWeight="bold"
          fill="hsl(213.6, 100%, 4.9%)"
          className="dark:fill-[hsl(220,10%,97.2%)]"
          style={{ transition: "fill 0.3s" }}
        >
          Nova Small
        </text>
      </svg>
    </div>
  );
};
