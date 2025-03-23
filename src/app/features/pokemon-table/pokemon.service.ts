import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, forkJoin, Observable, concatAll, catchError, throwError } from 'rxjs';

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

interface Pokemon {
  id: number;
  name: string;
  caught: boolean; // Added caught property
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) { }

  getPokemonPage(limit: number, offset: number): Observable<Pokemon[]> {
    const url = `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<PokemonListResponse>(url).pipe(
      map(response => response.results.map(pokemon => this.getPokemonDetails(pokemon.url))),
      map(pokemonDetailsRequests => forkJoin(pokemonDetailsRequests)),
      concatAll(),
      catchError(this.handleError) // Handle errors
    );
  }

  private getPokemonDetails(url: string): Observable<Pokemon> {
    return this.http.get<any>(url).pipe(
      map(pokemon => ({ id: pokemon.id, name: pokemon.name, caught: false })), // Added caught: false
      catchError(this.handleError) // Handle errors
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}
