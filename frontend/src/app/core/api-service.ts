import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { Order } from "./models";

@Injectable({ providedIn: "root" })
export class ApiService {
  http = inject(HttpClient);

  getOrders(search: string, start: number, end: number): Promise<Order[]> {
    const separator = search !== "" ? "&" : "?";
    const url = `/api/orders${search}${separator}start=${start}&end=${end}`;
    return firstValueFrom(this.http.get<Order[]>(url));
  }
}
