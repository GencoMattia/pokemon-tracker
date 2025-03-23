import { Component, OnInit } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Pokemon {
  id: number;
  name: string;
  caught: boolean;
}

@Component({
  selector: 'app-pokemon-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-table.component.html',
  styleUrl: './pokemon-table.component.sass'
})
export default class PokemonTableComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  filteredPokemonList: Pokemon[] = [];
  limit: number = 2000;
  offset: number = 0;
  searchTerm: string = '';
  caughtFilter: 'all' | 'caught' | 'uncaught' = 'all';
  private localStorageKey = 'pokemonList'; // Key for localStorage

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadPokemonFromLocalStorage(); // Load from localStorage first
    if (this.pokemonList.length === 0) {
      this.loadPokemonFromApi(); // If empty, load from API
    } else {
      this.applyFilters(); // Apply filters if loaded from localStorage
    }
  }

  loadPokemonFromApi(): void {
    this.pokemonService.getPokemonPage(this.limit, this.offset).subscribe({
      next: pokemon => {
        this.pokemonList = pokemon;
        this.savePokemonToLocalStorage(); // Save to localStorage after loading from API
        this.applyFilters();
        console.log(this.pokemonList);
      },
      error: error => {
        console.error('There was an error!', error);
      }
    });
  }

  loadPokemonFromLocalStorage(): void {
    const storedList = localStorage.getItem(this.localStorageKey);
    if (storedList) {
      this.pokemonList = JSON.parse(storedList);
    }
  }

  savePokemonToLocalStorage(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.pokemonList));
  }


  toggleCaught(pokemon: Pokemon): void {
    pokemon.caught = !pokemon.caught;
    console.log(`${pokemon.name} caught status: ${pokemon.caught}`);
    this.savePokemonToLocalStorage(); // Save after toggling
    this.applyFilters();
  }

  searchPokemon(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  filterCaught(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredList = [...this.pokemonList];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filteredList = filteredList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(term) || pokemon.id.toString().includes(term)
      );
    }

    if (this.caughtFilter === 'caught') {
      filteredList = filteredList.filter(pokemon => pokemon.caught);
    } else if (this.caughtFilter === 'uncaught') {
      filteredList = filteredList.filter(pokemon => !pokemon.caught);
    }

    this.filteredPokemonList = filteredList;
  }
}
