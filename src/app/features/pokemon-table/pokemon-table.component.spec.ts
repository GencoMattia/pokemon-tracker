import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import PokemonTableComponent from './pokemon-table.component';

describe('PokemonTableComponent', () => {
  let component: PokemonTableComponent;
  let fixture: ComponentFixture<PokemonTableComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PokemonTableComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonTableComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/pokemon'));
    req.flush({ count: 0, next: null, previous: null, results: [] });
    expect(component).toBeTruthy();
  });

  it('should load and sort the Pokédex from the API', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/pokemon'));
    req.flush({
      count: 2,
      next: null,
      previous: null,
      results: [
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      ],
    });

    expect(component.total()).toBe(2);
    expect(component.pokedex()[0].name).toBe('bulbasaur');
    expect(component.loading()).toBeFalse();
  });

  it('should toggle caught state and update the count', () => {
    const req = httpMock.expectOne((r) => r.url.includes('/pokemon'));
    req.flush({
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
    });

    const pikachu = component.pokedex()[0];
    expect(component.isCaught(pikachu)).toBeFalse();
    component.toggleCaught(pikachu);
    expect(component.isCaught(pikachu)).toBeTrue();
    expect(component.caughtCount()).toBe(1);
  });
});
