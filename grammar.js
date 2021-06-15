module.exports = grammar({
  name: 'fuior',

  extras: $ => [
    $.comment,
    /[ \t\r\f\v]/, // \s without \n
  ],

  rules: {
    source_file: $ => seq(
      repeat($._statement),
      optional($.return_statement),
    ),

    comment: $ => /\#[^\n]*/,

    _endl: $ => /\n/,
    _statement: $ => choice(
      $._endl,
      $.if_statement,
      $.choose_statement,
      $.stat_operation,
      $.command,
      $.show_text,
      $.declare_command_statement,
      $.define_command_statement,
      $.declare_var_statement,
    ),

    if_statement: $ => seq(
      'if',
      field('condition', $.condition),
      $.if_clause,
      repeat($.elseif_clause),
      optional($.else_clause),
      'end',
      $._endl,
    ),
    condition: $ => $._expression,
    if_clause: $ => $.block,
    elseif_clause: $ => seq('elseif', $.condition, $.block),
    else_clause: $ => seq('else', $.block),

    choose_statement: $ => seq(
      'choose',
      $._endl,
      repeat1($.choice),
      'end',
      $._endl,
    ),
    choice: $ => seq(
      '*',
      choice(
        seq(token(prec(2, '[')), $.choice_condition, ']', $.text_copy),
        $.text_copy,
      ),
      optional(seq($._endl, $.choice_meta)),
      $.block,
    ),
    choice_meta: $ => seq("meta", $.block, "end"),
    choice_condition: $ => $._expression,

    stat_operation: $ => seq(
      field('lvalue', alias($.identifier, $.stat_lvalue)),
      field('operator', $.stat_operator),
      field('rvalue', $.stat_rvalue),
    ),
    stat_operator: $ => choice('+', '-', '='),
    stat_rvalue: $ => $._expression,

    return_statement: $ => seq(
      'return',
      optional(field('return_value', alias($._expression, $.return_value))),
      $._endl,
    ),

    block: $ => seq(
      $._endl,
      repeat($._statement),
      optional($.return_statement),
    ),

    arg_definition: $ => seq(
      field('name', alias($.identifier, $.arg_name)),
      optional(
        seq(
          ':',
          field('type', alias($._type_expression, $.arg_type)),
        ),
      ),
    ),

    arg_definition_list: $ => seq(
      '(',
      choice(
        ')',
        seq($.arg_definition,
          choice(
            ')',
            seq(
              repeat(seq(',', $.arg_definition)),
              ')'
            ),
          ),
        ),
      ),
    ),

    command_signature: $ => seq(
      field('name', alias($.identifier, $.command_name)),
      field('arguments', $.arg_definition_list),
      optional(seq(
        ':',
        field('return_type', alias($._type_expression, $.return_type))
      ))
    ),

    declare_command_statement: $ => seq(
      'declare',
      'command',
      field('signature', $.command_signature),
      $._endl,
    ),

    define_command_statement: $ => seq(
      'command',
      field('signature', $.command_signature),
      field('body', $.block),
      'end',
      $._endl,
    ),

    arg_list: $ => seq('(', optional(seq(
      $._expression,
      repeat(seq(
        ',',
        $._expression,
      )),
    )), ')'),

    declare_var_decorator: $ => seq(
      '@',
      field('name', alias($.identifier, $.decorator_name)),
      optional($.arg_list),
    ),

    declare_var_statement: $ => seq(
      'var',
      field('name', alias($.identifier, $.var_name)),
      optional(seq(
        ':',
        field('type', alias($._type_expression, $.var_type)),
      )),
      repeat($.declare_var_decorator),
      optional(seq(
        '=',
        field('default_value', alias($._expression, $.var_default_value))
      )),
      $._endl,
    ),

    command: $ => seq(
      field('verb', alias($.identifier, $.command_verb)),
      repeat($.command_arg),
      $._endl,
    ),
    command_arg: $ => choice(
      $._literal,
      $.bare_word,
      seq('{', $._expression, '}'),
    ),
    bare_word: $ => token(prec(-1, /[^\s]+/)),

    show_text: $ => seq(
      field('actor', alias($.identifier, $.text_actor)),
      ':',
      choice(
        seq(
          token(prec(2, '[')),
          field('animation', alias($.identifier, $.text_animation)),
          ']',
          field('copy', $.text_copy),
        ),
        field('copy', $.text_copy),
      ),
      $._endl
    ),
    text_copy: $ => /[^\r\n\s][^\r\n]*[^\r\n\s]|[^\r\n\s]/,

    _type_expression: $ => choice(
      $.identifier,
      $.string,
      $.binary_type_expression,
      $.unary_type_expression,
      $.paran_type_expression,
    ),

    unary_type_expression: $ => prec(10, choice(
      seq('?', $._type_expression),
    )),

    binary_type_expression: $ => choice(
      prec.left(5, seq($._type_expression, '|', $._type_expression)),
      prec.left(5, seq($._type_expression, '&', $._type_expression)),
    ),

    paran_type_expression: $ => seq('(', $._type_expression, ')'),

    _expression: $ => choice(
      $.identifier,
      $.function_call,
      $._literal,
      $.unary_expression,
      $.binary_expression,
      $.paran_expression,
    ),

    _literal: $ => choice(
      $.number,
      $.intl_string,
      $.string,
      $.boolean,
    ),

    function_call: $ => seq(
      field('name', $.identifier),
      field('arg_list', $.arg_list),
    ),

    unary_expression: $ => prec(10, choice(
      seq('-', $._expression),
      seq('not', $._expression),
    )),

    binary_expression: $ => choice(
      prec.left(5, seq($._expression, '*', $._expression)),
      prec.left(5, seq($._expression, '/', $._expression)),
      prec.left(4, seq($._expression, '+', $._expression)),
      prec.left(4, seq($._expression, '-', $._expression)),
      prec.left(3, seq($._expression, '<', $._expression)),
      prec.left(3, seq($._expression, '>', $._expression)),
      prec.left(3, seq($._expression, '>=', $._expression)),
      prec.left(3, seq($._expression, '<=', $._expression)),
      prec.left(3, seq($._expression, '=', $._expression)),
      prec.left(3, seq($._expression, '!=', $._expression)),
      prec.left(2, seq($._expression, 'and', $._expression)),
      prec.left(1, seq($._expression, 'or', $._expression)),
    ),

    paran_expression: $ => seq('(', $._expression, ')'),

    identifier: $ => /[a-z_][a-z0-9_]*/,
    number: $ => /[0-9]+(\.[0-9]+)?/,
    intl_string: $ => /i"[^"]*"/,
    string: $ => /"[^"]*"/,
    boolean: $ => choice('true', 'false'),
  }
});
