import {Component, OnInit} from '@angular/core';
import {DeckComponent} from '../deck/deck.component';
import {StatsModel} from '../stats/stats.model';
import {DisplayableCardComponent} from '../deck/cards/displayable-card/displayable-card.component';
import {CardConfigModel} from '../deck/cards/card.config.model';
import {Card} from '../deck/cards/card';
import {BlackjackConstants} from '../shared/blackjack.constants';

/**
 * CardShoeComponent models a card shoe with 1..N decks.
 * During game play, all cards are taken from the shoe.
 * Each time a card is dealt, a value from the virtual card count
 * is decremented.
 */
@Component({
  selector: 'app-card-shoe',
  templateUrl: './card-shoe.component.html',
  styleUrls: []
})

export class CardShoeComponent implements OnInit {
  static DECKS_TO_USE = CardConfigModel.DECK_COLORS.length;
  private currentDeckIndex = 0;    // index into decks
  private currentCardIndex = 0;    // index into active deck
  private virtualActiveCards = 0;  // count of cards in shoe
  private lowValue = 0;
  private neutralValue = 0;
  private highValue = 0;
  private activeDeck: DeckComponent;
  private stats: StatsModel;

  constructor() {
    this.createDeck();
    this.initialize();
  }

  static getFaceImagePath(card: Card) {
    return '../assets/images/' + card.name + '.jpg';
  }

  /**
   * createDisplayableCard will take a base card (only having values) and creates
   * a card that can be displayed to the user. (has face and back image)
   * @param card - base card to be convert to a card with displayable front and back image
   * @param faceImagePath - path to image of front of card
   * @param backImagePath - path to card back.
   */
  static createDisplayableCard(card: Card, faceImagePath: string, backImagePath: string) {
    const newCard = new DisplayableCardComponent();
    newCard.name = card.name;
    newCard.value = card.value;
    newCard.countValue = card.countValue;
    newCard.faceImagePath = faceImagePath;
    newCard.backImagePath = backImagePath;
    return newCard;
  }

  ngOnInit() {

  }

  /**
   * createCardShoe create createDeck()s 1..N decks and adds each deck to the show.
   */
  createDeck() {
    this.activeDeck = new DeckComponent();
    this.initializeNewDeck();
  }

  initialize() {
    this.lowValue = 0;
    this.neutralValue = 0;
    this.highValue = 0;
    this.currentDeckIndex = 0;
    // make it look like shoe has N decks when it in reality we only
    // have one active deck.
    this.virtualActiveCards =
      CardShoeComponent.DECKS_TO_USE * BlackjackConstants.CARDS_IN_DECK;
    this.stats = new StatsModel(this.virtualActiveCards, 0, 0, 0);
    this.initializeNewDeck();
  }

  /**
   *  A deck is created one time.  Each time a "new" deck is initialized, we
   *  simply shuffle the current deck and increment an array holding the back image
   *  paths for the cards to make it looks like it's a new deck.
   */
  initializeNewDeck() {
    DeckComponent.shuffle(this.activeDeck.cards, 52);
    this.currentCardIndex = 0;
    this.activeDeck.deckBackingColor = CardConfigModel.DECK_COLORS[this.currentDeckIndex];
    // Increment to next backing deck color for next deck initialize
    this.currentDeckIndex = (this.currentDeckIndex + 1) % CardShoeComponent.DECKS_TO_USE;
  }

  // Decrement values for the virtual cards in shoe and index into current active deck
  withdrawCardFromShoe() {
    const card = this.activeDeck.cards[this.currentCardIndex];
    this.currentCardIndex = this.currentCardIndex + 1;
    // virtualActiveCards holds the number of all cards in the shoe.
    // which include a real active deck and N "virtual decks"
    this.virtualActiveCards = this.virtualActiveCards - 1;

    return card;
  }

  /**
   * getCard gets the next card in the deck.  It then creates a displayable card
   * which contains paths for front image
   * in the card shoe
   */
  get card(): DisplayableCardComponent {
    // If the entire shoe has been depleted, create a new one.
    // Else if current deck has been depleted, re-init deck to make
    // it look like a new one.
    if (this.virtualActiveCards === 0) {
      this.initialize();
    } else if (this.currentCardIndex === BlackjackConstants.CARDS_IN_DECK) {
      // exhausted current deck. advance index of deck colors to next color.
      this.initializeNewDeck();
    }

    const card = this.withdrawCardFromShoe();
    // create a displayable card from a base card that doesn't have image
    // path information.
    return CardShoeComponent.createDisplayableCard(
       card , CardShoeComponent.getFaceImagePath(card), this.activeDeck.backImagePath);
  }

  /**
   * updateStats accumulates the values for counting cards.
   * Face down cards are not counted as this tool simulates what
   * a player would be able to see to determine counts
   */
  updateStats(cards: DisplayableCardComponent[]) {
    if ((cards) && (cards.length > 0)) {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card.faceUp) {
          const countValue = card.countValue;
          if (countValue === BlackjackConstants.HIGH_CARD_VALUE) {
            this.highValue++;
          } else if (countValue === BlackjackConstants.NEUTRAL_CARD_VALUE) {
            this.neutralValue++;
          } else if (countValue === BlackjackConstants.LOW_CARD_VALUE) {
            this.lowValue++;
          }
        }
      }
    }
  }

  /**
   *  Get values for stats.
   */
  get counterStats(): StatsModel {
    return new StatsModel(this.virtualActiveCards, this.lowValue, this.neutralValue, this.highValue);
  }
}
