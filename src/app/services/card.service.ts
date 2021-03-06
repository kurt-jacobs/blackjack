import {EventEmitter, Injectable} from '@angular/core';
import {StatsService} from './stats.service';
import {CardShoeComponent} from '../card-shoe/card-shoe.component';
import {PlayStatus} from '../shared/play.status';
import {DisplayableCardComponent} from '../deck/cards/displayable-card/displayable-card.component';

@Injectable({
  providedIn: 'root',
})

export class CardService {
  private shoe: CardShoeComponent;
  private dealerFirstCard: DisplayableCardComponent;
  playerDeal = new EventEmitter<DisplayableCardComponent[]>();
  dealerDeal = new EventEmitter<DisplayableCardComponent[]>();
  dealerStatus = new EventEmitter<PlayStatus>();


  constructor(private statsService: StatsService) {
    this.shoe = new CardShoeComponent();
    this.publishStats();
  }

  requestUpdate() {
    this.publishStats();
  }

  // Deal cards to the dealer. First card is face down.
  dealDealerCards() {
    const cards: DisplayableCardComponent[] = [];
    this.dealerFirstCard = this.shoe.card;
    this.dealerFirstCard.faceUp = false;
    cards.push( this.dealerFirstCard);
    cards.push(this.shoe.card);
    this.shoe.updateStats(cards);
    this.dealerDeal.emit(cards);
  }

  // Deal cards to the player. Both cards are face up
  dealPlayerCards() {
    const cards: DisplayableCardComponent[] = [];
    cards.push(this.shoe.card);
    cards.push(this.shoe.card);
    this.shoe.updateStats(cards);

    this.playerDeal.emit(cards);
  }

  publishStats() {
    this.statsService.publishStats(this.shoe.counterStats);
  }

  // Deal both dealer and player and update the counter statistics
  // When shoe is within 10 cards of being out, the shoe resets.
  dealCards() {
    this.dealDealerCards();
    this.dealPlayerCards();
    this.publishStats();
  }

  requestCard() {
    const card = this.shoe.card;
    this.updateStatsWithCard(card);
    this.publishStats();
    if (card != null) {
      return card;
    }
  }

  requestStand() {
    this.dealerFirstCard.faceUp = true;
    this.updateStatsWithCard(this.dealerFirstCard);
    this.dealerStatus.emit(PlayStatus.player_stands);
    this.publishStats();
  }

  publishBust() {
    this.dealerFirstCard.faceUp = true;
    this.updateStatsWithCard(this.dealerFirstCard);
    this.dealerStatus.emit(PlayStatus.player_bust);
    this.publishStats();
  }


 updateStatsWithCard(card: DisplayableCardComponent) {
   const cards: DisplayableCardComponent[] = [];
   cards.push(card);
   this.shoe.updateStats(cards);
 }

}
