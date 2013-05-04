/*
This file contains TicTacToe.Game, a class to draw and manage the game board,
handle user input, and display the computer's moves.

This class uses the two other TicTacToe classes, ActionTable and Board.
*/

var TicTacToe = TicTacToe || {};

var GRID_THICKNESS = 1;
var GRID_THIN_COLOR = "#408ad2";
var GRID_THICK_COLOR = "#679ed2";
var X_TOKEN_COLOR = "#ff0084";
var O_TOKEN_COLOR = "#0063dc";
var DRAW_TOKEN_COLOR = "#830f9f";

TicTacToe.Game = function(element_id, cell_size) {
    // Represents a set of TicTacToe.Game boards, each board has its own
    // state, but they all share the lookup table for what action the computer
    // should perform for a given state.
    this.cell_size = cell_size;
    
    // create a lookup table for what moves we should make, assuming the
    // user goes first
    this.game_board = new TicTacToe.Board();
    this.action_table = new TicTacToe.ActionTable();
    this.action_table.populate(this.game_board, USER_PLAYER, COMPUTER_PLAYER);
    this.game_is_over = false;
    this.game_tokens = [];
    
    var container = document.getElementById(element_id);
    this.paper = this.create_paper(container);
    // set the parent container width so that the board is centered on the page
    container.style.width = this.paper.width + "px";
    var background = this.create_background();
    this.setup_mouse_handlers(background);
};

TicTacToe.Game.prototype.create_paper = function(container) {
    var width = this.cell_size * 3 + GRID_THICKNESS * 2; // leave some space for the last grid line
    var height = this.cell_size * 3 + GRID_THICKNESS * 2;
    
    var paper = Raphael(container, width, height);
    return paper;
};

TicTacToe.Game.prototype.create_background = function() {
    var background = this.paper.rect(0,0, this.paper.width, this.paper.height);
    background.attr({fill: "#fff", stroke: "none"});
    
    // draw a grid
    this.draw_grid(3, 3, this.cell_size, GRID_THICKNESS, GRID_THIN_COLOR);
    // draw a thicker grid to outline the individual boards
    this.draw_grid(1, 1, this.cell_size * 3, GRID_THICKNESS * 2, GRID_THICK_COLOR);
    
    return background;
};

TicTacToe.Game.prototype.setup_mouse_handlers = function(background_element) {
    background_element.click(_.bind(this.handle_click, this));
};

TicTacToe.Game.prototype.handle_click = function(event) {
    var position_column = Math.floor(event.offsetX / this.cell_size) % 3;
    var position_row = Math.floor(event.offsetY / this.cell_size) % 3;
    var position = position_row * 3 + position_column;
    
    if (this.game_is_over || this.game_board.data[position] != 0) {
        // Game is already over, or position already occupied, ignore the click
        return;
    }
    
    this.game_board.data[position] = USER_PLAYER;
    this.draw_token('x', position);
    
    if (this.game_board.player_has_won()) {
        // Game is now, player has won, this shouldn't happen, so throw an exception
        this.game_over('x_wins');
        throw new Error("player has won");
    }
    
    // since the user goes first, draws happen on the user's turn
    if (this.game_board.is_draw()) {
        this.game_over('draw');
        return;
    }
    
    var computer_position = this.action_table.get_action(this.game_board);
    this.game_board.data[computer_position] = COMPUTER_PLAYER;
    
    // after drawing the computer's move, mark the board as won
    // if the computer just won
    var game_over_callback;
    if (this.game_board.player_has_won()) {
        this.game_is_over = true; // set this now so the user can't still play pieces while the animation completes
        game_over_callback = function() {
            this.game_over('o_wins');
        };
    } else {
        game_over_callback = function() {
        };
    }
    
    var draw_computer_token_callback = function() {
        var token = this.draw_token('o', computer_position);
        token.attr({opacity: 0});
        token.animate({opacity: 1}, 500, "linear", _.bind(game_over_callback, this));
    }
    
    // draw the computer's move a short time later, if the computer is
    // too fast, it doesn't look as nice
    setTimeout(_.bind(draw_computer_token_callback, this), 250);
};

TicTacToe.Game.prototype.game_over = function(outcome) {
    // Mark the game as over and setup a button to reset the board.
    // Outcome is 'x_wins', 'o_wins', or 'draw'
    this.game_is_over = true;
    
    var overlay = this.overlay_board(outcome);
    
    var reset_callback = function() {
        this.reset_game(overlay);
    }
    
    overlay.click(_.bind(reset_callback, this));
};

TicTacToe.Game.prototype.reset_game = function(overlay) {
    // Reset the game to the initial state, deleting all game pieces
    this.game_is_over = false;
    overlay.remove();
    
    for (var index = 0; index < this.game_tokens.length; index++) {
        this.game_tokens[index].remove();
    }
    
    this.game_tokens = [];
    this.game_board = new TicTacToe.Board();
};

TicTacToe.Game.prototype.overlay_board = function(outcome) {
    // Mark an inactive board so that the user can see who won.
    // outcome is one of 'x_wins', 'o_wins', or 'draw'
    var x = GRID_THICKNESS*2;
    var y = GRID_THICKNESS*2;
    var size = this.cell_size * 3 - GRID_THICKNESS*2;
    
    var overlay = this.paper.rect(x, y, size, size);
    overlay.attr({opacity: 0, stroke: "none", fill: "white"});
    
    var token;
    if (outcome == 'x_wins') {
        token = this.draw_x(x, y, size);
    } else if (outcome == 'o_wins') {
        token = this.draw_o(x, y, size);
    } else if (outcome == 'draw') {
        token = this.paper.text(x + size/2, y + size/2,"D");
        token.attr({fill: DRAW_TOKEN_COLOR, stroke: "none", "font-family": "Arial", "font-size": size});
    } else {
        throw new Error("unknown outcome: " + outcome);
    }
    token.attr({opacity: 0});
    
    overlay.animate({opacity: 0.9}, 500, "linear");
    token.animate({opacity: 1}, 500, "linear");
    
    return this.paper.set([token, overlay]);
};
 
TicTacToe.Game.prototype.draw_token = function(token, position) {
    // Draw the token, either 'x' or 'o' to the specified board in the specified position
    var position_row = Math.floor(position / 3);
    var position_column = position % 3;
    
    var x = position_column * this.cell_size + GRID_THICKNESS;
    var y = position_row * this.cell_size + GRID_THICKNESS;
    
    var token_object;
    if (token == 'x') {
        token_object = this.draw_x(x, y, this.cell_size);
    } else if (token == 'o') {
        token_object = this.draw_o(x, y, this.cell_size);
    } else {
        throw new Error("invalid token: " + token);
    }
    this.game_tokens.push(token_object);
    return token_object;
};

TicTacToe.Game.prototype.draw_o = function(x, y, size) {
    // Draw an 'o' token at the specified coordinates (upper left corner)
    var outer_circle = this.paper.circle(x+size/2, y+size/2, size/2*0.7);
    outer_circle.attr({fill: "none", stroke: O_TOKEN_COLOR, "stroke-width": size/8});
    return outer_circle;
};

TicTacToe.Game.prototype.draw_x = function(x, y, size) {
    // Draw an 'x' token at the specified coordinates (upper left corner)
    var path_string = "M0,0Lx,xMx,0L0,x".replace(/x/g, size);
    var path = this.paper.path(path_string);
    path.attr({"stroke-width": size/8, stroke: X_TOKEN_COLOR});
    path.transform("T" + x + "," + y);
    path.scale(0.65, 0.65, size/2, size/2);
    return path;
};

TicTacToe.Game.prototype.draw_grid = function(x_squares, y_squares, spacing, thickness, fill) {
    // Draw a graph-paper-like grid with the requested number of squares
    for (var x_offset = 0; x_offset <= x_squares * spacing; x_offset += spacing) {
        var vertical_line = this.paper.rect(x_offset, 0, thickness, y_squares * spacing + thickness);
        vertical_line.attr({fill: fill, stroke: "none"});
    }
    
    for (var y_offset = 0; y_offset <= y_squares * spacing; y_offset += spacing) {
        var horizontal_line = this.paper.rect(0, y_offset, x_squares * spacing + thickness, thickness);
        horizontal_line.attr({fill: fill, stroke: "none"});
    }
};