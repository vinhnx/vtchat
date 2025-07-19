import { Atom, Star } from "lucide-react";

export const getIconByName = (iconName: string) => {
    switch (iconName) {
        case "Atom":
            return <Atom size={16} />;
        case "Star":
            return <Star size={16} />;
        default:
            return null;
    }
};
