;;; Highlighting for fuior

;;; Builtins
;; Keywords

(if_statement [ "if" "end" ] @conditional)
(elseif_clause "elseif" @conditional)
(else_clause "else" @conditional)

(choose_statement ["choose" "end"] @conditional)

(declare_var_statement "var" @keyword)
(return_statement "return") @keyword

;; Operators

[
 "not"
 "and"
 "or"
] @keyword.operator

[
"="
"-"
"*"
"/"
"+"
"<"
">"
"<="
">="
"!="
 ] @operator

;; Punctuation
[
  ":"
] @punctuation

;; Brackets
[
 "("
 ")"
 "["
 "]"
 "{"
 "}"
] @punctuation.bracket

;; Variables
[
  (identifier)
  (stat_lvalue)
] @variable
(declare_var_decorator ["@" (decorator_name)] @keyword)

;; Constants
(boolean) @boolean
(string) @string
(intl_string) @string
(number) @number

;; Functions
(command_signature (command_name) @function)
[
  (declare_command_statement ["declare" "command"])
  (define_command_statement "command")
] @keyword.function

(function_call (identifier) @function . (arg_list))

(command_verb) @function

;; Parameters
(arg_definition
  (arg_name) @parameter)

;; Types
(var_type (identifier) @type)
(arg_type (identifier) @type)
(return_type (identifier) @type)
(unary_type_expression (identifier) @type)
(binary_type_expression (identifier) @type)

;; Nodes
(comment) @comment

;; Text
(show_text (text_actor) @type)
(show_text (text_animation) @variable)
(text_copy) @string

;; Error
(ERROR) @error
