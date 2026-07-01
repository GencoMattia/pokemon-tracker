import {
  Component,
  computed,
  effect,
  ElementRef,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Pokemon, PokemonService } from './pokemon.service';

type CaughtFilter = 'all' | 'caught' | 'uncaught';

const CAUGHT_STORAGE_KEY = 'pokedex.caughtIds';
const PAGE_SIZE = 48;

@Component({
  selector: 'app-pokemon-table',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  templateUrl: './pokemon-table.component.html',
  styleUrl: './pokemon-table.component.sass',
})
export default class PokemonTableComponent implements OnDestroy {
  // ---- Raw data & remote state -------------------------------------------
  readonly pokedex = signal<Pokemon[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  // ---- Caught state (persisted independently from the dex) ----------------
  readonly caughtIds = signal<Set<number>>(this.loadCaughtIds());

  // ---- Filters ------------------------------------------------------------
  readonly searchTerm = signal('');
  readonly caughtFilter = signal<CaughtFilter>('all');

  // ---- Incremental rendering ---------------------------------------------
  private readonly visibleCount = signal(PAGE_SIZE);
  private readonly sentinel = viewChild<ElementRef<HTMLElement>>('sentinel');
  private observer?: IntersectionObserver;

  // ---- Derived views ------------------------------------------------------
  readonly filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.caughtFilter();
    const caught = this.caughtIds();

    return this.pokedex().filter((p) => {
      if (term && !p.name.toLowerCase().includes(term) && !String(p.id).includes(term)) {
        return false;
      }
      if (filter === 'caught') return caught.has(p.id);
      if (filter === 'uncaught') return !caught.has(p.id);
      return true;
    });
  });

  readonly visiblePokemon = computed(() => this.filtered().slice(0, this.visibleCount()));
  readonly hasMore = computed(() => this.visibleCount() < this.filtered().length);

  readonly caughtCount = computed(() => this.caughtIds().size);
  readonly total = computed(() => this.pokedex().length);
  readonly progress = computed(() => {
    const total = this.total();
    return total === 0 ? 0 : Math.round((this.caughtCount() / total) * 100);
  });

  constructor(private readonly pokemonService: PokemonService) {
    // Reset the incremental window whenever the filtered set changes.
    effect(() => {
      this.filtered();
      this.visibleCount.set(PAGE_SIZE);
    });

    // Infinite scroll: reveal the next page when the sentinel is near the
    // viewport. The sentinel enters/leaves the DOM with the list, so the
    // effect re-attaches the observer whenever it changes.
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting) && this.hasMore()) {
            this.visibleCount.update((n) => n + PAGE_SIZE);
          }
        },
        { rootMargin: '600px' }
      );

      effect(() => {
        const el = this.sentinel()?.nativeElement;
        this.observer?.disconnect();
        if (el) this.observer?.observe(el);
      });
    }

    this.load();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pokemonService.getPokedex().subscribe({
      next: (list) => {
        this.pokedex.set(list);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message ?? 'Impossibile caricare il Pokédex.');
        this.loading.set(false);
      },
    });
  }

  isCaught(pokemon: Pokemon): boolean {
    return this.caughtIds().has(pokemon.id);
  }

  toggleCaught(pokemon: Pokemon): void {
    this.caughtIds.update((current) => {
      const next = new Set(current);
      next.has(pokemon.id) ? next.delete(pokemon.id) : next.add(pokemon.id);
      return next;
    });
    this.saveCaughtIds();
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  resetProgress(): void {
    this.caughtIds.set(new Set());
    this.saveCaughtIds();
  }

  /** Fallback to the pixel sprite if the official artwork is missing. */
  onArtworkError(event: Event, pokemon: Pokemon): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== pokemon.sprite) {
      img.src = pokemon.sprite;
    }
  }

  trackById(_index: number, pokemon: Pokemon): number {
    return pokemon.id;
  }

  // ---- Persistence --------------------------------------------------------
  private loadCaughtIds(): Set<number> {
    try {
      const raw = localStorage.getItem(CAUGHT_STORAGE_KEY);
      return raw ? new Set<number>(JSON.parse(raw)) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  }

  private saveCaughtIds(): void {
    try {
      localStorage.setItem(CAUGHT_STORAGE_KEY, JSON.stringify([...this.caughtIds()]));
    } catch {
      // Storage may be unavailable (private mode / quota); ignore silently.
    }
  }
}
