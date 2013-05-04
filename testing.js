/*
This file contains some basic tests for TicTacToe.Board and
TicTacToe.ActionTable, to use it, include it in the main HTML file and then
execute "run_tests()" from the javascript console.
*/

function run_tests() {
    function assert(expression_value, message) {
        if (!expression_value) {
            console.log("assertion failed: " + message);
        }
    }
    
    assert(new TicTacToe.Board([0,0,0,0,0,0,0,0,0]).player_has_won() == null, "blank board is null");
    assert(new TicTacToe.Board([1,1,1,0,0,0,0,0,0]).player_has_won() == 1, "player 1 wins");
    assert(new TicTacToe.Board([1,1,2,0,0,0,0,0,0]).player_has_won() == null, "no winner is null");
    assert(new TicTacToe.Board([2,2,1,0,2,0,0,0,2]).player_has_won() == 2, "player 2 wins");
    
    assert(
        new TicTacToe.ActionTable().populate(
                new TicTacToe.Board([MAX_PLAYER,MAX_PLAYER,0,0,0,0,0,0,0]),
                MAX_PLAYER,
                MIN_PLAYER) == 1, "win in one move");
    
    assert(
        new TicTacToe.ActionTable().populate(
                new TicTacToe.Board([MAX_PLAYER,MAX_PLAYER,0,MAX_PLAYER,0,0,MAX_PLAYER,0,0]),
                MIN_PLAYER,
                MAX_PLAYER) == 1, "win in two moves");
                
    assert(
        new TicTacToe.ActionTable().populate(
                new TicTacToe.Board([MIN_PLAYER,MIN_PLAYER,0,MIN_PLAYER,0,0,MIN_PLAYER,0,0]),
                MAX_PLAYER,
                MIN_PLAYER) == -1, "lose in two moves");
    
    // attempt the final steps of a game
    var action_table = new TicTacToe.ActionTable();
    var game_board = new TicTacToe.Board([MIN_PLAYER, 0, 0, 0, MAX_PLAYER, 0, MIN_PLAYER, 0, 0]);
    action_table.populate(game_board, MAX_PLAYER, MIN_PLAYER);
    assert(action_table.get_action(game_board) == 3, "correct third to last action");
    game_board.data[3] = MAX_PLAYER;
    game_board.data[5] = MIN_PLAYER;
    assert(action_table.get_action(game_board) == 8, "correct second to last action");
    game_board.data[8] = MAX_PLAYER;
    game_board.data[1] = MIN_PLAYER;
    assert(action_table.get_action(game_board) == 2, "correct last action");
    game_board.data[2] = MAX_PLAYER;
    game_board.data[7] = MIN_PLAYER;
    assert(game_board.is_draw(), "game ends in draw");
    
}