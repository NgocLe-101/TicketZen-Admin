import { format } from "date-fns";

class ValueConverter {
  static currencyConverter(value) {
    return Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  }
  static dateConverter(value) {
    return new Date(value).toLocaleDateString("vi-VN");
  }
  static dateTimeConverter(value) {
    return format(new Date(value), "HH:mm, dd/MM/yyyy");
  }
}

export default ValueConverter;
