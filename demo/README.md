# Default Demo

The demo in this folder consists of three parties able to complete 6 contractual
interactions. The parties are as follows:

| Party                         | Description                                  |
|:------------------------------|:---------------------------------------------|
| [Final _Assembly_ Plant][asm] | A factory needing components from _Supplier_.|
| [_Supplier_][sup]             | A factory producing and supplying components.|
| [_Carrier_][car]              | A trucking company transporting goods.       |

The _Final Assembly Plant_, _Supplier_ and _Carrier_ are assumed to already
have traditional contracts in place, giving meaning to the different tokens
exchanged during the 6 interactions.

The interactions are as follows:

| # | Interaction            | Initiator | Receiver | Description              |
|:--|:-----------------------|:----------|:---------|:-------------------------|
| 1 | Component Order        | Assembly  | Supplier | Assembly orders components.|
| 2 | Transport Booking      | Supplier  | Carrier  | Supplier books transportation.|
| 3 | Transport Confirmation | Carrier   | Assembly | Carrier confirms transport with recipient.|
| 4 | Transport Completion   | Carrier   | Assembly | Carrier asks recipient to confirm transport completion.|
| 5 | Transport Payment      | Carrier   | Supplier | Carrier asks client to pay for the transportation.|
| 6 | Component Payment      | Supplier  | Assembly | Supplier asks assembly to pay for components.|

Note that these steps are not executed automatically. In order to run through
them, start the demo as described in the root [README.md][rmd] file. Each
step represent one change in the rights and obligations between the initiator
and receiver.

[asm]: http://localhost:8080
[sup]: http://localhost:8084
[car]: http://localhost:8082
[rmd]: ../README.md