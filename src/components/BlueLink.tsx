import React from "react";

type BlueLinkProps = {
    href?: string;
    children?: React.ReactNode;
};



export const BlueLink: React.FC<BlueLinkProps> = ({ href, children }) => {
    return (
        <a href={href} style={{ color: "blue", textDecoration: "underline" }}>
    {children}
    </a>
);
};