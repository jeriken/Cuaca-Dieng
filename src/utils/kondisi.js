// Sky condition estimated from the station's pressure (field3) and rain sensor (field5).
// Shared by the home page and the twibbon generator so both always agree.
export function getKondisi(pressure, rain) {
    if (pressure >= 798.5 && rain > 950) {
        return "Cerah";
    } else if (pressure > 796.5 && rain > 950) {
        return "Cerah Berawan";
    } else if (pressure > 794.0) {
        return "Berawan";
    } else if (pressure < 794.0 && rain < 950) {
        return "Hujan";
    } else if (pressure < 792.0 && rain < 950) {
        return "Hujan Lebat";
    } else {
        return "Berawan";
    }
}
