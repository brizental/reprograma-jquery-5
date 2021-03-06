// minas que terão no jogo
MINES = 40;
// altura da tabela
HEIGHT = 20;
// largura da tabela
WIDTH = 15;
TIMER = false;

$("window-controls").mouseover(function() {
    $(this).toggleClass("jogo-content");
});

// função que gera indíce randomico tanto para linha e coluna
function getUniqueRandomIndexesIn2DArray(table, indexes) {
    indexes = indexes ? indexes : [];
    for (var i = indexes.length; i < MINES; i++) {
        var random_cell = Math.floor(Math.random() * WIDTH);
        var random_row = Math.floor(Math.random() * HEIGHT);
        for (var j = 0; j < indexes.length; j++) {
            if (indexes[j][0] === random_cell &&
                indexes[j][1] === random_row) {
                return arguments.callee(table, indexes);
            }
        }
        indexes.push([random_cell, random_row]);
    }
    return indexes;
}

function getAdjacentCellIndexes(x, y) {
    return $.grep([
        [x - 1, y - 1],
        [x, y - 1],
        [x + 1, y - 1],
        [x - 1, y],
        [x + 1, y],
        [x - 1, y + 1],
        [x, y + 1],
        [x + 1, y + 1]
    ], function (element) {
        return element[0] >= 0 && element[1] >= 0 // verifica se os elementos são maiores que zero
            && element[0] < WIDTH && element[1] < HEIGHT // verifica se os elementos são menos que a largura e altura
    });
}


var field_matrix = [];
// pega a tabela
var field = $("#field table");
var counter = 0;
var mine_indexes;
for (var i = 0; i < HEIGHT; i++) {
    var row_vector = [];
    var row = $("<tr>"); // cria um novo elemento tr
    for (var j = 0; j < WIDTH; j++) { // irá criar as td de cada row
        var mine = $("<td>"); // cria um novo element td
        mine.data("mines", 0); // atributo mines será 0
        row.append(mine);
        row_vector.push(mine);
    }
    field.append(row);
    field_matrix.push(row_vector);
}

createButton();
createMines();
createNumbers();

$("#reset").mousedown(function () {
    if($(this).hasClass("game-over")) {
        $(this).toggleClass("game-over");
    }
    else {
        clearInterval(TIMER);
    }

    clearAttributes();
    createButton();
    createMines();
    createNumbers();
});

function clearAttributes() {
    $.each($(".mine"), function () {
        $(this).toggleClass("mine");
    });

    $.each($("td"), function () {
        $(this).text('');
        $(this).data("mines", 0);
    });

    counter = 0
    TIMER = false;
    $("#timer").text('');
    $("#mines").text('');
}

function createButton() {
    
    for (var i = 0; i < HEIGHT; i++) {
        var currentRow = $($("tr")[i]);
        console.log(currentRow);    
        for (var j = 0; j < WIDTH; j++) {
            var td = $(currentRow.children()[j]);
            var button = $("<div>");
            button.addClass("button");
            button.data("coordinates", [j, i]);
            td.append(button);

            button.contextmenu(function () {
                return false;
            });
    
            button.mousedown(function (event) {
                if (!TIMER) {
                    TIMER = setInterval(function () {
                        counter++;
                        $("#timer").text(counter);
                    }, 1000);
                }

                if (event.which === 3) {
                    $(this).toggleClass("red-flag");
                    $("#mines").text($(".red-flag").length);
                } else {
                    $("#reset").addClass("wow");
                }
            });
    
            button.mouseup(function (event) {
                $("#reset").removeClass("wow");
    
                if (!$(this).hasClass("red-flag") && event.which !== 3) {
    
                    if ($(this).parent().hasClass("mine")) {
                        $("td .button").each(function (index, button) {
                            button.remove();
                        })
                        $("#reset").addClass("game-over");
                        clearInterval(TIMER);
                    } 
                    else if ($(this).parent().data("mines") > 0) {
                        $(this).remove();
                    } 
                    else if ($(this).parent().data("mines") === 0) {
                        var coordinates = $(this).data("coordinates");
                        console.log(coordinates);
                        $(this).remove();
                        (function (x, y) {
    
                            var adjacent_cells = getAdjacentCellIndexes(x, y);
                            for (var k = 0; k < adjacent_cells.length; k++) {
                                var x = adjacent_cells[k][0];
                                var y = adjacent_cells[k][1];
                                var cell = $(field_matrix[y][x]);
                                var button = cell.children($(".button"));
                                if (button.length > 0) {
                                    button.remove();
                                    if (cell.data("mines") === 0) {
                                        arguments.callee(x, y);
                                    }
                                }
                            }
                        })(coordinates[0], coordinates[1]);
                    }
    
                    if ($("td .button").length === MINES) {
                        $("#reset").addClass("winner");
                        clearInterval(TIMER);
                    }
    
                }
            });
        }
    }
}

function createMines() {
    mine_indexes = getUniqueRandomIndexesIn2DArray(field_matrix);
    $.each(mine_indexes, function (index, coordinates) {
        var x = coordinates[0];
        var y = coordinates[1];
        var mine = $(field_matrix[y][x]);
        mine.addClass("mine");
    });
}

function createNumbers() {
    $.each(mine_indexes, function (index, coordinates) {
        var adjacent_cells = getAdjacentCellIndexes(coordinates[0], coordinates[1]);
        $.each(adjacent_cells, function (index, coordinates) {
            var x = coordinates[0];
            var y = coordinates[1];
            var cell = $(field_matrix[y][x]);
            if (!cell.hasClass("mine")) {
                var num_mines = cell.data("mines") + 1;
                cell.data("mines", num_mines);
                switch (num_mines) {
                    case 1:
                        cell.css("color", "blue");
                        break;
                    case 2:
                        cell.css("color", "green");
                        break;
                    case 3:
                        cell.css("color", "red");
                        break;
                    case 4:
                        cell.css("color", "navy");
                        break;
                    case 5:
                        cell.css("color", "maroon");
                        break;
                    case 6:
                        cell.css("color", "teal");
                        break;
                    case 7:
                        cell.css("color", "DarkMagenta");
                        break;
                    case 8:
                        cell.css("color", "black");
                        break;
                }
            }
        })
    });
    
    $.each(field_matrix, function(index, row) {
        $.each(row, function(index, cell) {
            var number = $(cell).data("mines");
            if (number > 0) {
                $(cell).append(number);
            }
        });
    })
}
