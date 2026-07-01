import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

/** Shape of a single entry returned by the PokeAPI list endpoint. */
interface PokeApiListEntry {
  name: string;
  url: string;
}

interface PokeApiListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokeApiListEntry[];
}

/** A Pokémon as used across the app. */
export interface Pokemon {
  id: number;
  name: string;
  /** High quality official artwork. */
  artwork: string;
  /** Small pixel sprite, used as a lightweight fallback. */
  sprite: string;
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';
  private readonly artworkBase =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  private readonly spriteBase =
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches the whole Pokédex in a single request.
   *
   * The list endpoint already returns each Pokémon's name and resource URL,
   * so the numeric id can be parsed from the URL without an extra request per
   * Pokémon. Sprite URLs are derived deterministically from the id.
   */
  getPokedex(limit = 2000): Observable<Pokemon[]> {
    const url = `${this.baseUrl}/pokemon?limit=${limit}&offset=0`;
    return this.http.get<PokeApiListResponse>(url).pipe(
      map((response) =>
        response.results
          .map((entry) => this.toPokemon(entry))
          .filter((p): p is Pokemon => p !== null)
          .sort((a, b) => a.id - b.id)
      ),
      catchError((err) => this.handleError(err))
    );
  }

  private toPokemon(entry: PokeApiListEntry): Pokemon | null {
    const id = this.extractId(entry.url);
    if (id === null) {
      return null;
    }
    return {
      id,
      name: entry.name,
      artwork: `${this.artworkBase}/${id}.png`,
      sprite: `${this.spriteBase}/${id}.png`,
    };
  }

  /** Extracts the trailing numeric id from a PokeAPI resource URL. */
  private extractId(url: string): number | null {
    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.error instanceof ErrorEvent
        ? `Errore di rete: ${error.error.message}`
        : `Il server ha risposto con codice ${error.status}.`;
    return throwError(() => new Error(message));
  }
}
